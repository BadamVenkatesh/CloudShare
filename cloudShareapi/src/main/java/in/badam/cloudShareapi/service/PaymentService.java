package in.badam.cloudShareapi.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import in.badam.cloudShareapi.documents.PaymentTransaction;
import in.badam.cloudShareapi.documents.ProfileDocument;
import in.badam.cloudShareapi.dto.PaymentDTO;
import in.badam.cloudShareapi.dto.PaymentVerificationDTO;
import in.badam.cloudShareapi.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentDTO createOrder(PaymentDTO paymentDTO){
        try {
            log.info("CreateOrder called");
           ProfileDocument currentProfile = profileService.getCurrentProfile();
           String clerkId = currentProfile.getClerkId();

            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId,razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount",paymentDTO.getAmount());
            orderRequest.put("currency",paymentDTO.getCurrency());
            orderRequest.put("receipt","order_"+System.currentTimeMillis());

            Order order = razorpayClient.orders.create(orderRequest);
            String orderId = order.get("id");
            log.info("CreateOrder Order Created");
            // Create Pending transaction order record
            PaymentTransaction transaction = PaymentTransaction.builder()
                    .clerkId(clerkId)
                    .orderId(orderId)
                    .planId(paymentDTO.getPlanId())
                    .amount(paymentDTO.getAmount())
                    .currency(paymentDTO.getCurrency())
                    .status("PENDING")
                    .transactionDate(LocalDateTime.now())
                    .userEmail(currentProfile.getEmail())
                    .userName(currentProfile.getFirstName()+" "+currentProfile.getLastName())
                    .build();
            paymentTransactionRepository.save(transaction);

            return PaymentDTO.builder()
                    .orderId(orderId)
                    .success(true)
                    .message("Order Created Successfully")
                    .build();
        } catch (Exception e) {
            log.error(e.getMessage());
            return PaymentDTO.builder()
                    .success(false)
                    .message("Error Creating Order"+e.getMessage())
                    .build();
        }
    }

    public PaymentDTO verifyPayment(PaymentVerificationDTO request){
        try{
            ProfileDocument currentProfile = profileService.getCurrentProfile();
            String clerkId = currentProfile.getClerkId();

            String data = request.getRazorpay_order_id() + "|" + request.getRazorpay_payment_id();
            String generatedSignature = generateHamcSha256Signature(data,razorpayKeySecret);
            if(!generatedSignature.equals(request.getRazorpay_signature())){
                updateTransactionStatus(request.getRazorpay_order_id(),"FAILED",request.getRazorpay_payment_id(),null);
                return PaymentDTO.builder()
                        .success(false)
                        .message("Payment Signature Verification Failed")
                        .build();
            }

            int creditsToAdd = 0;
            String plan = switch (request.getPlanId()) {
                case "premium" -> {
                    creditsToAdd = 500;
                    yield "PREMIUM";
                }
                case "ultimate" -> {
                    creditsToAdd = 10;
                    yield "ULTIMATE";
                }
                default -> "BASIC";
            };

            if(creditsToAdd > 0){
                userCreditsService.addCredits(clerkId,creditsToAdd,plan);
                updateTransactionStatus(request.getRazorpay_order_id(),"SUCCESS",request.getRazorpay_payment_id(),creditsToAdd);
                return PaymentDTO.builder()
                        .success(true)
                        .message("Payment Verified and credits added successfully")
                        .credits(userCreditsService.getUserCredits(clerkId).getCredits())
                        .build();
            }else{
                updateTransactionStatus(request.getRazorpay_order_id(),"FAILED",request.getRazorpay_payment_id(),null);
                return PaymentDTO.builder()
                        .success(false)
                        .message("Invalid Plan Selected")
                        .build();
            }
        } catch (Exception e) {
            try{
                updateTransactionStatus(request.getRazorpay_order_id(),"ERROR",request.getRazorpay_payment_id(),null);
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
            return  PaymentDTO.builder()
                    .success(false)
                    .message("Error Verifying Payment")
                    .build();
        }
    }

    private String generateHamcSha256Signature(String data, String razorpayKeySecret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            // Convert byte array to hexadecimal string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating HMAC SHA256 signature", e);
        }
    }

    private void updateTransactionStatus(String razorpayOrderId, String status, String razorpayPaymentId, Integer creditsToAdd) {
        paymentTransactionRepository.findAll().stream()
                .filter(t -> t.getOrderId() != null && t.getOrderId().equals(razorpayOrderId))
                .findFirst()
                .map(transaction -> {
                    transaction.setStatus(status);
                    transaction.setPaymentId(razorpayPaymentId);
                    if(creditsToAdd!=null){
                        transaction.setCreditsAdded(creditsToAdd);
                    }
                    return paymentTransactionRepository.save(transaction);
                })
                .orElse(null);
    }
}

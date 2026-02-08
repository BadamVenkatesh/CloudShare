package in.badam.cloudShareapi.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import in.badam.cloudShareapi.documents.UserCredits;
import in.badam.cloudShareapi.repository.UserCreditsRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserCreditsService {

    private final UserCreditsRepository userCreditsRepository;
    private final ProfileService profileService;

    public UserCredits createIntialCredits(String clerkId){
        UserCredits userCredits = UserCredits.builder()
            .clerkId(clerkId)
            .credits(5)
            .plan("BASIC")
            .build();
        return userCreditsRepository.save(userCredits);
    }

    public UserCredits getUserCredits(String clerkId){
        log.info("getUserCredits called with clerkId"+clerkId);
        return userCreditsRepository.findByClerkId(clerkId)
                .orElseGet(()->createIntialCredits(clerkId));
    }

    public UserCredits getUserCredits(){
        log.info("getUserCredits called");
        String clerkId = profileService.getCurrentProfile().getClerkId();
        log.info("getUserCredits called with clerkId"+clerkId);
        return getUserCredits(clerkId);
    }

    public Boolean hasEnoughCredits(int requiredCredits){
        UserCredits userCredits = getUserCredits();
        return userCredits.getCredits() >= requiredCredits;
    }

    public UserCredits consumeCredit(){
        UserCredits userCredits = getUserCredits();
        if(userCredits.getCredits() <= 0){
            return null;
        }
        userCredits.setCredits(userCredits.getCredits()-1);
        return userCreditsRepository.save(userCredits);
    }

    public  UserCredits addCredits(String clerkId,Integer creditsToAdd,String plan){
        UserCredits userCredits = userCreditsRepository.findByClerkId(clerkId)
                .orElseGet(()->createIntialCredits(clerkId));
        userCredits.setCredits(userCredits.getCredits()+creditsToAdd);
        userCredits.setPlan(plan);
        return userCreditsRepository.save(userCredits);
    }
}

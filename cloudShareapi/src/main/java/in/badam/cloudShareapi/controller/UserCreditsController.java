package in.badam.cloudShareapi.controller;

import in.badam.cloudShareapi.documents.UserCredits;
import in.badam.cloudShareapi.dto.UserCreditsDTO;
import in.badam.cloudShareapi.service.UserCreditsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserCreditsController {
    private final UserCreditsService userCreditsService;

    @GetMapping("/credits")
    public ResponseEntity<?> getUserCredits(){
        log.info("GET /credits called");
        UserCredits userCredits = userCreditsService.getUserCredits();
        log.info("Fetching userCredits" + userCredits.getCredits());
        UserCreditsDTO response = UserCreditsDTO.builder()
                .credits(userCredits.getCredits())
                .plan(userCredits.getPlan())
                .build();

        return ResponseEntity.ok(response);
    }
}

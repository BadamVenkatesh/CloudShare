package in.badam.cloudShareapi.service;
import java.time.Instant;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import in.badam.cloudShareapi.documents.ProfileDocument;
import in.badam.cloudShareapi.dto.ProfileDTO;
import in.badam.cloudShareapi.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileDTO createProfile(ProfileDTO profileDTO){

        if(profileRepository.existsByClerkId(profileDTO.getClerkId())){
            return updateProfile(profileDTO);
        }

        ProfileDocument profile = ProfileDocument.builder()
            .clerkId(profileDTO.getClerkId())
            .email(profileDTO.getEmail())
            .firstName(profileDTO.getFirstName())
            .lastName(profileDTO.getLastName())
            .photoUrl(profileDTO.getPhotoUrl())
            .credits(5)
            .createdAt(Instant.now())
            .build();
        
        profileRepository.save(profile);

        return ProfileDTO.builder()
            .id(profile.getId())
            .clerkId(profile.getClerkId())
            .email(profile.getEmail())
            .firstName(profile.getFirstName())
            .lastName(profile.getLastName())
            .photoUrl(profile.getPhotoUrl())
            .credits(profile.getCredits())
            .createdAt(profile.getCreatedAt())
            .build();
    }

    public ProfileDTO updateProfile(ProfileDTO profileDTO){
        ProfileDocument existingProfile = profileRepository.findByClerkId(profileDTO.getClerkId());
        if(existingProfile != null){
            if(existingProfile.getEmail() != null && !existingProfile.getEmail().isEmpty()){
                existingProfile.setEmail(profileDTO.getEmail());
            }
            if(existingProfile.getFirstName() != null && !existingProfile.getFirstName().isEmpty()){
                existingProfile.setFirstName(profileDTO.getFirstName());
            }
            if(existingProfile.getLastName() != null && !existingProfile.getLastName().isEmpty()){
                existingProfile.setLastName(profileDTO.getLastName());
            }
            if(existingProfile.getPhotoUrl() != null && !existingProfile.getPhotoUrl().isEmpty()){
                existingProfile.setPhotoUrl(profileDTO.getPhotoUrl());
            }

            profileRepository.save(existingProfile);

            return ProfileDTO.builder()
                .id(existingProfile.getId())
                .clerkId(existingProfile.getClerkId())
                .email(existingProfile.getEmail())
                .firstName(existingProfile.getFirstName())
                .lastName(existingProfile.getLastName())
                .photoUrl(existingProfile.getPhotoUrl())
                .credits(existingProfile.getCredits())
                .createdAt(existingProfile.getCreatedAt())
                .build();
        }
        return null;
    }

    public boolean existsByClerkId(String clerkId){
        return profileRepository.existsByClerkId(clerkId);
    }

    public void deleteProfile(String clerkId){
        ProfileDocument existingProfile = profileRepository.findByClerkId(clerkId);
        if(existingProfile != null){
            profileRepository.delete(existingProfile);
        }
    }

    public ProfileDocument getCurrentProfile(){

        if(SecurityContextHolder.getContext().getAuthentication()==null){
            throw new UsernameNotFoundException("User not authenticated");
        }
        String clerkId = SecurityContextHolder.getContext().getAuthentication().getName();

        return profileRepository.findByClerkId(clerkId);
    }
}

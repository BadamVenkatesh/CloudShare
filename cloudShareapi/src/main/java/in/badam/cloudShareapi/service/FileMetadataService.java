package in.badam.cloudShareapi.service;

import in.badam.cloudShareapi.documents.FileMetaDocument;
import in.badam.cloudShareapi.documents.ProfileDocument;
import in.badam.cloudShareapi.dto.FileMetadataDTO;
import in.badam.cloudShareapi.repository.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileMetadataService {
    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;
    private final FileMetadataRepository fileMetadataRepository;

    public List<FileMetadataDTO> uploadFiles(MultipartFile files[]){
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        List<FileMetaDocument> savedFiles = new ArrayList<>();

        if(!userCreditsService.hasEnoughCredits(files.length)){
            throw new RuntimeException("Not Enough Credits. Please purchase more credits");
        }

        Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        for(MultipartFile file:files){
            String filename = UUID.randomUUID()+"."+ StringUtils.getFilenameExtension(file.getOriginalFilename());
            Path targetLocation = uploadPath.resolve(filename);
            try {
                Files.copy(file.getInputStream(),targetLocation, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            FileMetaDocument fileMetaDocument = FileMetaDocument.builder()
                    .fileLocation(targetLocation.toString())
                    .name(file.getOriginalFilename())
                    .size(file.getSize())
                    .type(file.getContentType())
                    .clerkId(currentProfile.getClerkId())
                    .isPublic(false)
                    .uploadedAt(LocalDateTime.now())
                    .build();
            // TODO : consume each credit for one upload
            userCreditsService.consumeCredit();
            savedFiles.add(fileMetadataRepository.save(fileMetaDocument));
        }
        return savedFiles.stream().map(fileMetaDocument -> mapToDTO(fileMetaDocument))
                .collect(Collectors.toList());
    }

    private FileMetadataDTO mapToDTO(FileMetaDocument fileMetaDocument) {
        return FileMetadataDTO.builder()
                .id(fileMetaDocument.getId())
                .fileLocation(fileMetaDocument.getFileLocation())
                .name(fileMetaDocument.getName())
                .size(fileMetaDocument.getSize())
                .type(fileMetaDocument.getType())
                .clerkId(fileMetaDocument.getClerkId())
                .isPublic(fileMetaDocument.getIsPublic())
                .uploadedAt(fileMetaDocument.getUploadedAt())
                .build();
    }

    public List<FileMetadataDTO> getFiles(){
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        List<FileMetaDocument> files = fileMetadataRepository.findByClerkId(currentProfile.getClerkId());
        return files.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public FileMetadataDTO getPublicFile(String id){
        Optional<FileMetaDocument> fileOptional = fileMetadataRepository.findById(id);
        if(fileOptional.isEmpty() || !fileOptional.get().getIsPublic()){
            throw new RuntimeException("Unable to get the file");
        }
        FileMetaDocument document = fileOptional.get();
        return mapToDTO(document);
    }

    public FileMetadataDTO getDownloadableFile(String id){
        FileMetaDocument file = fileMetadataRepository.findById(id).orElseThrow(()->new RuntimeException("File Not Found"));
        return mapToDTO(file);
    }

    public void deleteFile(String id){
        try {
            ProfileDocument currentProfile = profileService.getCurrentProfile();
            FileMetaDocument file = fileMetadataRepository.findById(id)
                    .orElseThrow(()->new RuntimeException("File not found"));
            if(!file.getClerkId().equals(currentProfile.getClerkId())){
                throw new RuntimeException("File doesn't belong to current User");
            }

            Path filepath = Paths.get(file.getFileLocation());
            Files.deleteIfExists(filepath);
            fileMetadataRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Error Deleting the File"+e);
        }
    }

    public FileMetadataDTO togglePublic(String id){
        FileMetaDocument file = fileMetadataRepository.findById(id)
                .orElseThrow(()->new RuntimeException("File not found"));
        file.setIsPublic(!file.getIsPublic());
        fileMetadataRepository.save(file);
        return mapToDTO(file);
    }
}

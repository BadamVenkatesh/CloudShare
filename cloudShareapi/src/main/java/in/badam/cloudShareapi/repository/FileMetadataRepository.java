package in.badam.cloudShareapi.repository;

import in.badam.cloudShareapi.documents.FileMetaDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileMetadataRepository extends MongoRepository<FileMetaDocument,String> {

    List<FileMetaDocument> findByClerkId(String clerkId);
    Long countByClerkId(String clerkId);
}

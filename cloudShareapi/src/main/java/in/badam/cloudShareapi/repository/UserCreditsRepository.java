package in.badam.cloudShareapi.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import in.badam.cloudShareapi.documents.UserCredits;

import java.util.Optional;

public interface UserCreditsRepository extends MongoRepository<UserCredits, String>{
    Optional<UserCredits> findByClerkId(String clerkId);
}

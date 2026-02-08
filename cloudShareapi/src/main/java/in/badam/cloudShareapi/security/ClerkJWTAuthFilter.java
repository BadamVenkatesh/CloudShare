package in.badam.cloudShareapi.security;

import java.io.IOException;

import java.util.Base64;
import java.security.PublicKey;
import java.util.Collections;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Claims;

import com.fasterxml.jackson.databind.JsonNode;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Slf4j
public class ClerkJWTAuthFilter extends OncePerRequestFilter{
    
    @Value("${clerk.issuer}")
    private String clerkIssuer;

    private final ClerkJwksProvider jwksProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

            if(request.getRequestURI().contains("/webhooks") ||
                    request.getRequestURI().contains("/public") ||
                    request.getRequestURI().contains("/download")){
                filterChain.doFilter(request, response);
                return;
            }
        log.info("Processing request: {} {}", request.getMethod(), request.getRequestURI());
        String authHeader = request.getHeader("Authorization");
        log.info("Authorization header: {}", authHeader != null ? "Present" : "Missing");
        if(authHeader==null || !authHeader.startsWith("Bearer ")){
                response.sendError(HttpServletResponse.SC_FORBIDDEN,"Authorization Header missing/invalid");
                return;
            }
            try{
                String token = authHeader.substring(7);
                String[] chunks = token.split("\\.");
                if(chunks.length < 3){
                    response.sendError(HttpServletResponse.SC_FORBIDDEN,"Invalid JWT Token");
                    return;
                }

                String headerJson = new String(Base64.getUrlDecoder().decode(chunks[0]));
                ObjectMapper mapper = new ObjectMapper();
                JsonNode headerNode = mapper.readTree(headerJson);

                if(!headerNode.has("kid")){
                    response.sendError(HttpServletResponse.SC_FORBIDDEN,"Token Header is Missing kid");
                    return;
                }

                String kid = headerNode.get("kid").asText();
                PublicKey publicKey = jwksProvider.getPublicKey(kid);

                log.info("Verifying token with issuer: {}", clerkIssuer);
                //verify the token 
                Claims claims = Jwts.parserBuilder()
                                .setSigningKey(publicKey)
                                .setAllowedClockSkewSeconds(60)
                                .requireIssuer(clerkIssuer)
                                .build()
                                .parseClaimsJws(token)
                                .getBody();
                String clerkId = claims.getSubject();
                log.info("Token validated successfully for user: {}", clerkId);
                log.debug("Claims: {}", claims);


                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(clerkId, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                log.info("Authentication set in SecurityContext");
                filterChain.doFilter(request, response);
            }catch(Exception e){
                response.sendError(HttpServletResponse.SC_FORBIDDEN,"Invalid JWT Token: "+e.getMessage());
            }
    }
}

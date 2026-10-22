package com.prep.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prep.backend.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByResetPasswordToken(String resetPasswordToken);

    Optional<User> findByDeleteAccountToken(String deleteAccountToken);

    Optional<User> findByDeleteAccountCode(String deleteAccountCode);
}
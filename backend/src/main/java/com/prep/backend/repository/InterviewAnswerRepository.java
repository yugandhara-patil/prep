package com.prep.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewAnswer;

@Repository
public interface InterviewAnswerRepository
        extends JpaRepository<InterviewAnswer, Long> {

    List<InterviewAnswer> findByInterviewOrderByIdAsc(Interview interview);
}
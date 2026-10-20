package com.prep.backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Integration test requires a live MySQL database instance")
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}

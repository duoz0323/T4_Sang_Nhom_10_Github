package stu.edu.Backend_Nhom10;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableFeignClients
public class BackendNhom10Application {
	public static void main(String[] args) {
		SpringApplication.run(BackendNhom10Application.class, args);
	}
}

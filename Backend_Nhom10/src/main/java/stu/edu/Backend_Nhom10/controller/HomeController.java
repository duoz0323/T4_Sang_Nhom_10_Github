package stu.edu.Backend_Nhom10.controller; 

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Backend Java Nhóm 10 đã sẵn sàng và đang chạy 24/7!";
    }
}
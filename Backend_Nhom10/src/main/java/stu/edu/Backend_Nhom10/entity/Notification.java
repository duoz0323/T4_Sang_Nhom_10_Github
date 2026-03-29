package stu.edu.Backend_Nhom10.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.enums.NotificationType;
import stu.edu.Backend_Nhom10.enums.ReceiverType;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(nullable = false)
    String title;
    @Column(columnDefinition = "TEXT")
    String description;
    String link;
    @Column(nullable = false)
    Boolean isRead=false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    NotificationType type;

    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    String receiverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ReceiverType receiverType;
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}

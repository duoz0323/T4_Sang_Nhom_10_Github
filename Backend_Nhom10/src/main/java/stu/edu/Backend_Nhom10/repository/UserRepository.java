package stu.edu.Backend_Nhom10.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stu.edu.Backend_Nhom10.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
}

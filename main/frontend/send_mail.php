<?php
echo "PHP script is working";
exit;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Sanitize and validate input
    $first_name = htmlspecialchars($_POST['first_name']);
    $last_name = htmlspecialchars($_POST['last_name']);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $phone = htmlspecialchars($_POST['phone']);
    $message = htmlspecialchars($_POST['message']);

    // Validate fields
    if (empty($first_name) || empty($last_name) || empty($email) || empty($message)) {
        echo "All required fields must be filled out.";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email address.";
        exit;
    }

    // Email configuration
    $to = "noorrsayed03@gmail.com"; // Replace with recipient's email
    $subject = "New Contact Form Submission";
    $body = "Name: $first_name $last_name\nEmail: $email\nPhone: $phone\nMessage:\n$message";
    $headers = "From: $email";

    // Send email
    if (mail($to, $subject, $body, $headers)) {
        echo "Your message has been sent successfully!";
    } else {
        echo "Failed to send your message.";
    }
} else {
    echo "Invalid request.";
}
?>

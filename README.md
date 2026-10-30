# AWS-CloudShield
Cloud-Based Disaster Recovery and Backup System using AWS

#Purpose of CloudShield
Objective: CloudShield is a cloud-based Disaster Recovery (DR) and Data Protection System designed to safeguard enterprise backup files against data corruption, accidental deletion, and ransomware overwrites.   
Primary AWS Mechanism: It utilizes Amazon S3 Object Versioning in the ap-south-1 (Mumbai) region to preserve every revision of an uploaded file.  
Non-Destructive Restoration: Instead of overwriting or deleting bad data, CloudShield performs an AWS Boto3 copy_object (Copy-to-Head) operation. This duplicates any chosen historical snapshot back to the head position as the current version without destroying previous state history.   
Key Performance Metrics: Achieving a Recovery Point Objective (RPO) < 1.0s and an RTO < 3.0s with zero data loss. 

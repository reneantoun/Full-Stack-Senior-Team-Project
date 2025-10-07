# Credentials Folder

## The purpose of this folder is to store all credentials needed to log into your server and databases. This is important for many reasons. But the two most important reasons is
    1. Grading , servers and databases will be logged into to check code and functionality of application. Not changes will be unless directed and coordinated with the team.
    2. Help. If a class TA or class CTO needs to help a team with an issue, this folder will help facilitate this giving the TA or CTO all needed info AND instructions for logging into your team's server. 


# Below is a list of items required. Missing items will causes points to be deducted from multiple milestone submissions.

1. Server URL: http://ec2-18-224-202-27.us-east-2.compute.amazonaws.com
2. SSH username: ubuntu
3. SSH key: 648_Team02.pem (in folder)
5. Database IP: 127.0.0.1 (server's localhost)
6. Database port: 3306
7. Database username: student
8. Database password: password
9. Database name: student_username

# Connect to Server
The SSH key must not be publicly viewable for SSH to work. Use this command if needed
> chmod 400 648_Team2.pem

Now connect to the instance using this command
> ssh -i "648_Team2.pem" ubuntu@ec2-18-224-202-27.us-east-2.compute.amazonaws.com

# Access Database
Enter the following command and it will prompt for a password, respond with provided Database username and password.
> mysql -u student -p

Once logged in, enter this command to connect to the database you have access to
> connect student_username

Now you'll be free to execute SQL commands against the connected database!

# Most important things to Remember
## These values need to kept update to date throughout the semester. <br>
## <strong>Failure to do so will result it points be deducted from milestone submissions.</strong><br>
## You may store the most of the above in this README.md file. DO NOT Store the SSH key or any keys in this README.md file.

        function checkPasscode() {
            // Set your correct passcode here
            const correctPasscode = "ericsandlin";
            const userPasscode = document.getElementById("passcode").value;
            
            if (userPasscode === correctPasscode) {
                // If the passcode is correct, open the desired URL
                window.location.href = "JSGames.html";
            } 
            else {
                // Show an alert if the passcode is incorrect
                alert("Incorrect passcode. Please try again.");
            }
        }
document.addEventListener("DOMContentLoaded", function() {
    
    const searchButton = document.getElementById("search-button");
    const userNameInput = document.getElementById("uname");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-level");
    const mediumLabel = document.getElementById("medium-level");
    const hardLabel = document.getElementById("hard-level");
    const cardStatsContainer = document.querySelector(".stats-card");

    function validateUserName(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    searchButton.addEventListener('click', function() {
        const username = userNameInput.value.trim();
        console.log("Logging username: ", username);
        if (validateUserName(username)) {
            fetchUserDetails(username);
        }
    });

    async function fetchUserDetails(username) {

        function updateProgress(solved, total, label, circle){

            const progressDegree = (solved/total)*100;
            circle.style.setProperty("--progress-degree", `${progressDegree}%`);
            label.textContent = `${solved}/${total}`;

        }

        function displayData(parseData) {
            const totalQues = parseData.data.allQuestionsCount[0].count;
            const totalEasy = parseData.data.allQuestionsCount[1].count;
            const totalMedium = parseData.data.allQuestionsCount[2].count;
            const totalHard = parseData.data.allQuestionsCount[3].count;

            const solvedTotalQues = parseData.data.matchedUser.submitStats.acSubmissionNum[0].count;
            const solvedTotalEasyQues = parseData.data.matchedUser.submitStats.acSubmissionNum[1].count;
            const solvedTotalMediumQues = parseData.data.matchedUser.submitStats.acSubmissionNum[2].count;
            const solvedTotalHardQues = parseData.data.matchedUser.submitStats.acSubmissionNum[3].count;

            updateProgress(solvedTotalQues, totalEasy, easyLabel, easyProgressCircle )
            updateProgress(solvedTotalQues, totalMedium, mediumLabel, mediumProgressCircle)
            updateProgress(solvedTotalQues, totalHard, hardLabel, hardProgressCircle )

            const cardsData = [
                {label: "Oveall Submission", value: parseData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
                {label: "Oveall Easy Submission", value: parseData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
                {label: "Oveall Medium Submission", value: parseData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
                {label: "Oveall Hard Submission", value: parseData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions}
            ];

            cardStatsContainer.innerHTML = cardsData.map(
                data => { 
                    return `
                    <div class="card">
                    <h3>${data.label}</h3>
                    <p>${data.value}</p>
                    `

            }
        ).join("");

        }

        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql';
            
            const myHeaders = new Headers({
                "Content-Type": "application/json"
            });

            const graphql = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                        allQuestionsCount {
                            difficulty
                            count
                        }
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                                totalSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                            }
                        }
                    }
                `,
                variables: { "username": username }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) { // ✅ Corrected Logic
                throw new Error("Unable to fetch user details");
            }

            const parseData = await response.json();
            console.log("Logging Data: ", parseData);

            displayData(parseData);

        } catch (error) {
            console.error("Error fetching data:", error);
            statsContainer.innerHTML = '<p>No Data Found</p>';
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }
});

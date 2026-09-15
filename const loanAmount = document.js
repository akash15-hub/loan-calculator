const loanAmount = document.getElementById("loanAmount");
const loanSlider = document.getElementById("loanSlider");

const interestRate = document.getElementById("interestRate");
const interestSlider = document.getElementById("interestSlider");

const tenure = document.getElementById("tenure");
const tenureSlider = document.getElementById("tenureSlider");

const emiElement = document.getElementById("emi");
const principalElement = document.getElementById("principal");
const totalInterestElement = document.getElementById("totalInterest");
const totalPaymentElement = document.getElementById("totalPayment");

const principalBar = document.getElementById("principalBar");
const interestBar = document.getElementById("interestBar");

const loanPercent = document.getElementById("loanPercent");

const rateDisplay = document.getElementById("rateDisplay");
const tenureDisplay = document.getElementById("tenureDisplay");

const insightText = document.getElementById("insightText");

const calculateBtn = document.getElementById("calculateBtn");


// ==============================
// INDIAN RUPEE FORMAT
// ==============================

function formatINR(number) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(number);

}


// ==============================
// EMI CALCULATION
// ==============================

function calculateEMI() {

    let P = Number(loanAmount.value);

    let annualRate = Number(interestRate.value);

    let years = Number(tenure.value);


    // Monthly interest rate

    let monthlyRate = annualRate / 12 / 100;


    // Number of months

    let months = years * 12;


    let EMI;


    if (monthlyRate === 0) {

        EMI = P / months;

    } else {

        EMI =
            P *
            monthlyRate *
            Math.pow(1 + monthlyRate, months) /
            (Math.pow(1 + monthlyRate, months) - 1);

    }


    let totalPayment = EMI * months;

    let totalInterest = totalPayment - P;


    // Percentages

    let principalPercentage =
        (P / totalPayment) * 100;

    let interestPercentage =
        (totalInterest / totalPayment) * 100;


    // ==========================
    // UPDATE UI
    // ==========================

    animateValue(
        emiElement,
        EMI
    );

    principalElement.textContent =
        formatINR(P);

    totalInterestElement.textContent =
        formatINR(totalInterest);

    totalPaymentElement.textContent =
        formatINR(totalPayment);


    principalBar.style.width =
        principalPercentage + "%";

    interestBar.style.width =
        interestPercentage + "%";


    loanPercent.textContent =
        Math.round(principalPercentage) + "%";


    rateDisplay.textContent =
        annualRate + "%";


    tenureDisplay.textContent =
        years + (years === 1 ? " Year" : " Years");


    // ==========================
    // SMART INSIGHT
    // ==========================

    if (interestPercentage > 35) {

        insightText.textContent =
            "Your interest burden is relatively high. A shorter tenure or lower interest rate could reduce the total interest significantly.";

    } else if (interestPercentage > 25) {

        insightText.textContent =
            "Consider making occasional prepayments. Even small extra payments can reduce your overall interest.";

    } else {

        insightText.textContent =
            "Your principal makes up most of the repayment. This indicates a relatively efficient loan structure.";

    }

}


// ==============================
// NUMBER ANIMATION
// ==============================

function animateValue(element, finalValue) {

    const duration = 500;

    const startTime = performance.now();

    function update(currentTime) {

        const elapsed =
            currentTime - startTime;

        const progress =
            Math.min(elapsed / duration, 1);

        const ease =
            1 - Math.pow(1 - progress, 3);

        const value =
            finalValue * ease;

        element.textContent =
            formatINR(value);


        if (progress < 1) {

            requestAnimationFrame(update);

        }

    }

    requestAnimationFrame(update);

}


// ==============================
// LOAN AMOUNT
// ==============================

loanSlider.addEventListener("input", () => {

    loanAmount.value =
        loanSlider.value;

    calculateEMI();

});


loanAmount.addEventListener("input", () => {

    let value =
        Number(loanAmount.value);

    if (value < 10000) {

        value = 10000;

    }

    if (value > 10000000) {

        value = 10000000;

    }

    loanSlider.value =
        value;

    calculateEMI();

});


// ==============================
// INTEREST
// ==============================

interestSlider.addEventListener("input", () => {

    interestRate.value =
        interestSlider.value;

    calculateEMI();

});


interestRate.addEventListener("input", () => {

    let value =
        Number(interestRate.value);

    if (value < 1) {

        value = 1;

    }

    if (value > 30) {

        value = 30;

    }

    interestSlider.value =
        value;

    calculateEMI();

});


// ==============================
// TENURE
// ==============================

tenureSlider.addEventListener("input", () => {

    tenure.value =
        tenureSlider.value;

    calculateEMI();

});


tenure.addEventListener("input", () => {

    let value =
        Number(tenure.value);

    if (value < 1) {

        value = 1;

    }

    if (value > 30) {

        value = 30;

    }

    tenureSlider.value =
        value;

    calculateEMI();

});


// ==============================
// LOAN TYPE
// ==============================

const loanButtons =
    document.querySelectorAll(".loan-btn");

loanButtons.forEach(button => {

    button.addEventListener("click", () => {

        loanButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");


        const type =
            button.dataset.type;


        // Different typical interest suggestions

        if (type === "Home") {

            interestRate.value = 8.5;
            interestSlider.value = 8.5;

        }

        else if (type === "Car") {

            interestRate.value = 9.5;
            interestSlider.value = 9.5;

        }

        else if (type === "Personal") {

            interestRate.value = 12.5;
            interestSlider.value = 12.5;

        }

        calculateEMI();

    });

});


// ==============================
// CALCULATE BUTTON
// ==============================

calculateBtn.addEventListener("click", () => {

    calculateEMI();

    calculateBtn.style.transform =
        "scale(0.97)";

    setTimeout(() => {

        calculateBtn.style.transform =
            "";

    }, 150);

});


// ==============================
// INITIAL CALCULATION
// ==============================

calculateEMI();
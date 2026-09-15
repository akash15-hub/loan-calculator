const hasDocument = typeof document !== "undefined";
const root = hasDocument ? document : null;

const loanAmount = root ? document.getElementById("loanAmount") : null;
const loanSlider = root ? document.getElementById("loanSlider") : null;

const interestRate = root ? document.getElementById("interestRate") : null;
const interestSlider = root ? document.getElementById("interestSlider") : null;

const tenure = root ? document.getElementById("tenure") : null;
const tenureSlider = root ? document.getElementById("tenureSlider") : null;

const emiValue = root ? document.getElementById("emiValue") : null;
const principalValue = root ? document.getElementById("principalValue") : null;
const totalInterestValue = root ? document.getElementById("totalInterestValue") : null;
const totalPaymentValue = root ? document.getElementById("totalPaymentValue") : null;
const loanDisplay = root ? document.getElementById("loanDisplay") : null;
const rateDisplay = root ? document.getElementById("rateDisplay") : null;
const tenureDisplay = root ? document.getElementById("tenureDisplay") : null;
const loanPercent = root ? document.getElementById("loanPercent") : null;
const principalBar = root ? document.getElementById("principalBar") : null;
const interestBar = root ? document.getElementById("interestBar") : null;
const loanTypeLabel = root ? document.getElementById("loanTypeLabel") : null;
const insightText = root ? document.getElementById("insightText") : null;
const calculateBtn = root ? document.querySelector(".primary-btn") : null;
const compareBtn = root ? document.querySelector(".secondary-btn") : null;
const loanButtons = root ? document.querySelectorAll(".loan-btn") : [];

let audioContextInstance = null;

function ensureAudioContext() {
  if (typeof window === "undefined") return null;

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;

  if (!audioContextInstance) {
    audioContextInstance = new AudioCtor();
  }

  if (audioContextInstance.state === "suspended") {
    audioContextInstance.resume();
  }

  return audioContextInstance;
}

function playBillTone() {
  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  const gain = context.createGain();
  const toneA = context.createOscillator();
  const toneB = context.createOscillator();

  toneA.type = "triangle";
toneB.type = "sine";
  toneA.frequency.setValueAtTime(780, now);
toneB.frequency.setValueAtTime(1160, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  toneA.connect(gain);
toneB.connect(gain);
gain.connect(context.destination);

  toneA.start(now);
toneB.start(now + 0.012);
toneA.stop(now + 0.22);
toneB.stop(now + 0.24);
}

function playBillChime() {
  playBillTone();
  setTimeout(() => {
    playBillTone();
  }, 90);
}

function formatINR(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeValue);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getActiveLoanType() {
  const activeButton = root ? document.querySelector(".loan-btn.active") : null;
  return activeButton ? activeButton.dataset.type : "Home";
}

function calculateLoanStats(principalValueInput, annualRateInput, yearsInput) {
  const principal = clamp(Number(principalValueInput || 0), 10000, 10000000);
  const annualRate = clamp(Number(annualRateInput || 0), 1, 30);
  const years = clamp(Number(yearsInput || 1), 1, 30);

  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;

  let emi = 0;
  if (monthlyRate === 0) {
    emi = principal / months;
  } else {
    emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  return {
    principal,
    annualRate,
    years,
    monthlyRate,
    months,
    emi,
    totalPayment,
    totalInterest,
  };
}

function animateValue(element, finalValue) {
  if (!element) return;

  const duration = 450;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = finalValue * ease;

    element.textContent = formatINR(value);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function updateMiniStatCards(activeType) {
  const statEls = document.querySelectorAll(".mini-stat strong");
  const values = [
    Math.round(calculateLoanStats(Number(loanAmount.value), Number(interestRate.value), Number(tenure.value)).emi),
    Number(interestRate.value),
    `${Number(tenure.value)} yrs`,
  ];

  if (statEls.length >= 3) {
    statEls[0].textContent = `₹ ${Number(values[0]).toLocaleString("en-IN")}`;
    statEls[1].textContent = `${Number(values[1]).toFixed(1).replace(/\.0$/, "")}%`;
    statEls[2].textContent = values[2];
  }

  if (loanTypeLabel) {
    loanTypeLabel.textContent = `${activeType} Loan`;
  }
}

function calculateEMI() {
  if (!loanAmount || !loanSlider || !interestRate || !interestSlider || !tenure || !tenureSlider) {
    return;
  }

  const principal = clamp(Number(loanAmount.value || 0), 10000, 10000000);
  const annualRate = clamp(Number(interestRate.value || 0), 1, 30);
  const years = clamp(Number(tenure.value || 1), 1, 30);

  loanAmount.value = principal;
  loanSlider.value = principal;
  interestRate.value = annualRate;
  interestSlider.value = annualRate;
  tenure.value = years;
  tenureSlider.value = years;

  const stats = calculateLoanStats(principal, annualRate, years);
  const principalPercentage = stats.totalPayment > 0 ? (stats.principal / stats.totalPayment) * 100 : 0;
  const interestPercentage = stats.totalPayment > 0 ? (stats.totalInterest / stats.totalPayment) * 100 : 0;

  if (loanDisplay) {
    loanDisplay.textContent = formatINR(stats.principal);
  }

  if (rateDisplay) {
    rateDisplay.textContent = `${stats.annualRate.toFixed(1).replace(/\.0$/, "")}%`;
  }

  if (tenureDisplay) {
    tenureDisplay.textContent = `${stats.years} ${stats.years === 1 ? "Year" : "Years"}`;
  }

  animateValue(emiValue, stats.emi);

  if (principalValue) principalValue.textContent = formatINR(stats.principal);
  if (totalInterestValue) totalInterestValue.textContent = formatINR(stats.totalInterest);
  if (totalPaymentValue) totalPaymentValue.textContent = formatINR(stats.totalPayment);

  if (principalBar) principalBar.style.width = `${principalPercentage}%`;
  if (interestBar) {
    interestBar.style.width = `${interestPercentage}%`;
    interestBar.style.left = `${principalPercentage}%`;
  }

  if (loanPercent) {
    loanPercent.textContent = `${Math.round(principalPercentage)}%`;
  }

  const activeType = getActiveLoanType();
  if (loanTypeLabel) {
    loanTypeLabel.textContent = `${activeType} Loan`;
  }

  updateMiniStatCards(activeType);

  if (insightText) {
    if (interestPercentage > 35) {
      insightText.textContent =
        "Your interest burden is relatively high. A shorter tenure or lower interest rate could reduce the total interest significantly.";
    } else if (interestPercentage > 25) {
      insightText.textContent =
        "Consider making occasional prepayments. Even small extra payments can reduce your overall interest.";
    } else {
      insightText.textContent =
        "Your principal makes up most of the repayment. This indicates a balanced and efficient loan structure.";
    }
  }
}

if (root) {
  loanSlider.addEventListener("input", () => {
    loanAmount.value = loanSlider.value;
    calculateEMI();
    playBillChime();
  });

  loanAmount.addEventListener("input", () => {
    const value = Number(loanAmount.value || 0);
    const safeValue = clamp(value, 10000, 10000000);
    loanAmount.value = safeValue;
    loanSlider.value = safeValue;
    calculateEMI();
    playBillChime();
  });

  interestSlider.addEventListener("input", () => {
    interestRate.value = interestSlider.value;
    calculateEMI();
    playBillChime();
  });

  interestRate.addEventListener("input", () => {
    const value = Number(interestRate.value || 0);
    const safeValue = clamp(value, 1, 30);
    interestRate.value = safeValue;
    interestSlider.value = safeValue;
    calculateEMI();
    playBillChime();
  });

  tenureSlider.addEventListener("input", () => {
    tenure.value = tenureSlider.value;
    calculateEMI();
    playBillChime();
  });

  tenure.addEventListener("input", () => {
    const value = Number(tenure.value || 0);
    const safeValue = clamp(value, 1, 30);
    tenure.value = safeValue;
    tenureSlider.value = safeValue;
    calculateEMI();
    playBillChime();
  });

  loanButtons.forEach((button) => {
    button.addEventListener("click", () => {
      loanButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const type = button.dataset.type;
      if (type === "Home") {
        interestRate.value = 8.5;
        interestSlider.value = 8.5;
      } else if (type === "Car") {
        interestRate.value = 9.5;
        interestSlider.value = 9.5;
      } else if (type === "Personal") {
        interestRate.value = 12.5;
        interestSlider.value = 12.5;
      }

      calculateEMI();
      playBillChime();
    });
  });

  if (calculateBtn) {
    calculateBtn.addEventListener("click", () => {
      calculateEMI();
      playBillChime();
      calculateBtn.style.transform = "scale(0.97)";
      setTimeout(() => {
        calculateBtn.style.transform = "";
      }, 150);
    });
  }

  if (compareBtn) {
    compareBtn.addEventListener("click", () => {
      document.querySelector(".calculator-panel").scrollIntoView({ behavior: "smooth", block: "center" });
      const currentIndex = Array.from(loanButtons).findIndex((button) => button.classList.contains("active"));
      const nextType = currentIndex === loanButtons.length - 1 ? loanButtons[0] : loanButtons[currentIndex + 1];
      nextType.click();
    });
  }

  calculateEMI();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateLoanStats,
    formatINR,
  };
}

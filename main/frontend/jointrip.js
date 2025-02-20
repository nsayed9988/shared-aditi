// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIIwPjnFskKiEvEIhSb5KXgevBNyduSDk",
    authDomain: "ty-project-80ab7.firebaseapp.com",
    projectId: "ty-project-80ab7",
    storageBucket: "ty-project-80ab7.firebasestorage.app",
    messagingSenderId: "491495110151",
    appId: "1:491495110151:web:035795af4bc8eebff79ca2",
    measurementId: "G-XFS1VYTHSM",
    databaseURL: "https://ty-project-80ab7-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to open the stepper form when Join Now is clicked
function joinTrip(tripId) {
    // Fetch trip details from Firebase
    fetchTripDetails(tripId).then(tripData => {
      createStepperForm(tripData);
    }).catch(error => {
      alert("Error fetching trip details: " + error.message);
    });
  }
  
  // Function to fetch trip details from Firebase
  function fetchTripDetails(tripId) {
    return new Promise((resolve, reject) => {
      // Reference to all public-trips paths in the database
      const dbRef = ref(database, 'travel-bookings');
      
      get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Iterate through all email addresses
          for (const email in data) {
            if (data[email]['public-trips'] && data[email]['public-trips'][tripId]) {
              resolve({
                ...data[email]['public-trips'][tripId],
                id: tripId,
                creatorEmail: email
              });
              return;
            }
          }
          reject(new Error("Trip not found"));
        } else {
          reject(new Error("No travel bookings found"));
        }
      }).catch(error => {
        reject(error);
      });
    });
  }
  
  // Function to create and display the stepper form
  function createStepperForm(tripData) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'stepper-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
  
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'stepper-modal-content';
    modalContent.style.cssText = `
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      width: 80%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    `;
  
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    `;
    closeButton.onclick = () => document.body.removeChild(modal);
  
    // Create stepper header
    const stepperHeader = document.createElement('div');
    stepperHeader.className = 'stepper-header';
    stepperHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    `;
  
    // Create steps
    const steps = [
      { name: "Personal Info" },
      { name: "Trip Type" },
      { name: "Review & Submit" }
    ];
  
    steps.forEach((step, index) => {
      const stepElement = document.createElement('div');
      stepElement.className = `step ${index === 0 ? 'active' : ''}`;
      stepElement.dataset.step = index;
      stepElement.style.cssText = `
        flex: 1;
        text-align: center;
        padding: 10px;
        position: relative;
      `;
  
      const stepCircle = document.createElement('div');
      stepCircle.className = 'step-circle';
      stepCircle.innerText = index + 1;
      stepCircle.style.cssText = `
        width: 30px;
        height: 30px;
        background-color: ${index === 0 ? '#00d2ff' : '#ccc'};
        color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto 5px;
      `;
  
      const stepName = document.createElement('div');
      stepName.className = 'step-name';
      stepName.innerText = step.name;
  
      stepElement.appendChild(stepCircle);
      stepElement.appendChild(stepName);
      stepperHeader.appendChild(stepElement);
  
      // Add connector line between steps
      if (index < steps.length - 1) {
        const connector = document.createElement('div');
        connector.className = 'connector';
        connector.style.cssText = `
          flex: 0.5;
          height: 2px;
          background-color: #ccc;
          margin-top: 15px;
        `;
        stepperHeader.appendChild(connector);
      }
    });
  
    // Create stepper content container
    const stepperContent = document.createElement('div');
    stepperContent.className = 'stepper-content';
  
    // Create step 1 content (Personal Info)
    const step1Content = createPersonalInfoStep(tripData);
    step1Content.style.display = 'block';
  
    // Create step 2 content (Trip Type)
    const step2Content = createTripTypeStep(tripData);
    step2Content.style.display = 'none';
  
    // Create step 3 content (Review & Submit)
    const step3Content = createReviewStep();
    step3Content.style.display = 'none';
  
    // Add step contents to stepper content
    stepperContent.appendChild(step1Content);
    stepperContent.appendChild(step2Content);
    stepperContent.appendChild(step3Content);
  
    // Create navigation buttons
    const navigationButtons = document.createElement('div');
    navigationButtons.className = 'navigation-buttons';
    navigationButtons.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    `;
  
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Previous';
    prevButton.style.cssText = `
      padding: 10px 15px;
      background-color: #ccc;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      display: none;
    `;
  
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.style.cssText = `
      padding: 10px 15px;
      background-color: #00d2ff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    `;
  
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Submit';
    submitButton.style.cssText = `
      padding: 10px 15px;
      background-color: #00d2ff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      display: none;
    `;
  
    navigationButtons.appendChild(prevButton);
    navigationButtons.appendChild(nextButton);
    navigationButtons.appendChild(submitButton);
  
    // Add all elements to modal content
    modalContent.appendChild(closeButton);
    modalContent.appendChild(stepperHeader);
    modalContent.appendChild(stepperContent);
    modalContent.appendChild(navigationButtons);
  
    // Add modal content to modal
    modal.appendChild(modalContent);
  
    // Add modal to document body
    document.body.appendChild(modal);
  
    // Initialize form data object
    const formData = {
      tripId: tripData.id,
      tripDestination: tripData.destination,
      creatorEmail: tripData.creatorEmail,
      endDate: tripData.endDate
    };
  
    // Button event listeners
    let currentStep = 0;
  
    prevButton.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  
    nextButton.addEventListener('click', () => {
      if (validateStep(currentStep, formData, tripData)) {
        goToStep(currentStep + 1);
      }
    });
  
    submitButton.addEventListener('click', () => {
      if (validateStep(currentStep, formData, tripData)) {
        submitJoinRequest(formData);
      }
    });
  
    function goToStep(stepIndex) {
      // Update current step
      currentStep = stepIndex;
      
      // Update step indicators
      const stepElements = document.querySelectorAll('.step');
      stepElements.forEach((step, index) => {
        const circle = step.querySelector('.step-circle');
        if (index < stepIndex) {
          step.classList.remove('active');
          step.classList.add('completed');
          circle.style.backgroundColor = '#4CAF50';
        } else if (index === stepIndex) {
          step.classList.add('active');
          step.classList.remove('completed');
          circle.style.backgroundColor = '#00d2ff';
        } else {
          step.classList.remove('active', 'completed');
          circle.style.backgroundColor = '#ccc';
        }
      });
  
      // Update connector lines
      const connectors = document.querySelectorAll('.connector');
      connectors.forEach((connector, index) => {
        connector.style.backgroundColor = index < stepIndex ? '#4CAF50' : '#ccc';
      });
  
      // Show/hide step content
      const stepContents = document.querySelectorAll('.stepper-content > div');
      stepContents.forEach((content, index) => {
        content.style.display = index === stepIndex ? 'block' : 'none';
      });
  
      // Update navigation buttons
      prevButton.style.display = stepIndex > 0 ? 'block' : 'none';
      nextButton.style.display = stepIndex < steps.length - 1 ? 'block' : 'none';
      submitButton.style.display = stepIndex === steps.length - 1 ? 'block' : 'none';
  
      // If moving to review step, populate review content
      if (stepIndex === 2) {
        populateReviewStep(formData);
      }
    }
  }
  
  // Function to create Personal Info step
  function createPersonalInfoStep(tripData) {
    const stepContainer = document.createElement('div');
    stepContainer.className = 'step-content personal-info-step';
    
    const stepTitle = document.createElement('h2');
    stepTitle.innerText = 'Personal Information';
    stepTitle.style.marginBottom = '20px';
    
    const form = document.createElement('form');
    form.id = 'personal-info-form';
    
    // Name field
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    nameGroup.style.marginBottom = '15px';
    
    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'name';
    nameLabel.innerText = 'Full Name:';
    nameLabel.style.display = 'block';
    nameLabel.style.marginBottom = '5px';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'name';
    nameInput.name = 'name';
    nameInput.required = true;
    nameInput.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    `;
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    // Email field
    const emailGroup = document.createElement('div');
    emailGroup.className = 'form-group';
    emailGroup.style.marginBottom = '15px';
    
    const emailLabel = document.createElement('label');
    emailLabel.htmlFor = 'email';
    emailLabel.innerText = 'Email Address:';
    emailLabel.style.display = 'block';
    emailLabel.style.marginBottom = '5px';
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.name = 'email';
    emailInput.required = true;
    emailInput.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    `;
    
    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    
    // Age field
    const ageGroup = document.createElement('div');
    ageGroup.className = 'form-group';
    ageGroup.style.marginBottom = '15px';
    
    const ageLabel = document.createElement('label');
    ageLabel.htmlFor = 'age';
    ageLabel.innerText = 'Age:';
    ageLabel.style.display = 'block';
    ageLabel.style.marginBottom = '5px';
    
    const ageInput = document.createElement('input');
    ageInput.type = 'number';
    ageInput.id = 'age';
    ageInput.name = 'age';
    ageInput.min = '18';
    ageInput.max = '100';
    ageInput.required = true;
    ageInput.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    `;
    
    ageGroup.appendChild(ageLabel);
    ageGroup.appendChild(ageInput);
    
    // Gender field
    const genderGroup = document.createElement('div');
    genderGroup.className = 'form-group';
    genderGroup.style.marginBottom = '15px';
    
    const genderLabel = document.createElement('label');
    genderLabel.innerText = 'Gender:';
    genderLabel.style.display = 'block';
    genderLabel.style.marginBottom = '5px';
    
    const genderOptions = document.createElement('div');
    genderOptions.className = 'gender-options';
    genderOptions.style.display = 'flex';
    genderOptions.style.gap = '15px';
    
    // Female option
    const femaleLabel = document.createElement('label');
    femaleLabel.style.display = 'flex';
    femaleLabel.style.alignItems = 'center';
    femaleLabel.style.cursor = 'pointer';
    
    const femaleInput = document.createElement('input');
    femaleInput.type = 'radio';
    femaleInput.id = 'female';
    femaleInput.name = 'gender';
    femaleInput.value = 'female';
    femaleInput.required = true;
    femaleInput.style.marginRight = '5px';
    
    femaleLabel.appendChild(femaleInput);
    femaleLabel.appendChild(document.createTextNode('Female'));
    
    // Male option
    const maleLabel = document.createElement('label');
    maleLabel.style.display = 'flex';
    maleLabel.style.alignItems = 'center';
    maleLabel.style.cursor = 'pointer';
    
    const maleInput = document.createElement('input');
    maleInput.type = 'radio';
    maleInput.id = 'male';
    maleInput.name = 'gender';
    maleInput.value = 'male';
    maleInput.style.marginRight = '5px';
    
    maleLabel.appendChild(maleInput);
    maleLabel.appendChild(document.createTextNode('Male'));
    
    // Other option
    const otherLabel = document.createElement('label');
    otherLabel.style.display = 'flex';
    otherLabel.style.alignItems = 'center';
    otherLabel.style.cursor = 'pointer';
    
    const otherInput = document.createElement('input');
    otherInput.type = 'radio';
    otherInput.id = 'other';
    otherInput.name = 'gender';
    otherInput.value = 'other';
    otherInput.style.marginRight = '5px';
    
    otherLabel.appendChild(otherInput);
    otherLabel.appendChild(document.createTextNode('Other'));
    
    genderOptions.appendChild(femaleLabel);
    genderOptions.appendChild(maleLabel);
    genderOptions.appendChild(otherLabel);
    
    genderGroup.appendChild(genderLabel);
    genderGroup.appendChild(genderOptions);
    
    // Add fields to form
    form.appendChild(nameGroup);
    form.appendChild(emailGroup);
    form.appendChild(ageGroup);
    form.appendChild(genderGroup);
    
    // Add form to step container
    stepContainer.appendChild(stepTitle);
    stepContainer.appendChild(form);
    
    return stepContainer;
  }
  
  // Function to create Trip Type step
  function createTripTypeStep(tripData) {
    const stepContainer = document.createElement('div');
    stepContainer.className = 'step-content trip-type-step';
    
    const stepTitle = document.createElement('h2');
    stepTitle.innerText = 'Trip Type Information';
    stepTitle.style.marginBottom = '20px';
    
    const form = document.createElement('form');
    form.id = 'trip-type-form';
    
    // Trip Type selection
    const tripTypeGroup = document.createElement('div');
    tripTypeGroup.className = 'form-group';
    tripTypeGroup.style.marginBottom = '20px';
    
    const tripTypeLabel = document.createElement('label');
    tripTypeLabel.innerText = `Is this a domestic or international trip for you? (Destination: ${tripData.destination})`;
    tripTypeLabel.style.display = 'block';
    tripTypeLabel.style.marginBottom = '10px';
    tripTypeLabel.style.fontWeight = 'bold';
    
    const tripTypeOptions = document.createElement('div');
    tripTypeOptions.className = 'trip-type-options';
    tripTypeOptions.style.display = 'flex';
    tripTypeOptions.style.gap = '20px';
    
    // Domestic option
    const domesticLabel = document.createElement('label');
    domesticLabel.style.display = 'flex';
    domesticLabel.style.alignItems = 'center';
    domesticLabel.style.cursor = 'pointer';
    
    const domesticInput = document.createElement('input');
    domesticInput.type = 'radio';
    domesticInput.id = 'domestic';
    domesticInput.name = 'tripType';
    domesticInput.value = 'domestic';
    domesticInput.required = true;
    domesticInput.style.marginRight = '8px';
    
    domesticLabel.appendChild(domesticInput);
    domesticLabel.appendChild(document.createTextNode('Domestic'));
    
    // International option
    const internationalLabel = document.createElement('label');
    internationalLabel.style.display = 'flex';
    internationalLabel.style.alignItems = 'center';
    internationalLabel.style.cursor = 'pointer';
    
    const internationalInput = document.createElement('input');
    internationalInput.type = 'radio';
    internationalInput.id = 'international';
    internationalInput.name = 'tripType';
    internationalInput.value = 'international';
    internationalInput.style.marginRight = '8px';
    
    internationalLabel.appendChild(internationalInput);
    internationalLabel.appendChild(document.createTextNode('International'));
    
    tripTypeOptions.appendChild(domesticLabel);
    tripTypeOptions.appendChild(internationalLabel);
    
    tripTypeGroup.appendChild(tripTypeLabel);
    tripTypeGroup.appendChild(tripTypeOptions);
    
    // Passport information section (initially hidden)
    const passportSection = document.createElement('div');
    passportSection.id = 'passport-section';
    passportSection.style.display = 'none';
    passportSection.style.marginTop = '20px';
    passportSection.style.padding = '15px';
    passportSection.style.border = '1px solid #ddd';
    passportSection.style.borderRadius = '5px';
    passportSection.style.backgroundColor = '#f9f9f9';
    
    const passportTitle = document.createElement('h3');
    passportTitle.innerText = 'Passport Information';
    passportTitle.style.marginBottom = '15px';
    
    // Passport Number field
    const passportNumberGroup = document.createElement('div');
    passportNumberGroup.className = 'form-group';
    passportNumberGroup.style.marginBottom = '15px';
    
    const passportNumberLabel = document.createElement('label');
    passportNumberLabel.htmlFor = 'passportNumber';
    passportNumberLabel.innerText = 'Passport Number:';
    passportNumberLabel.style.display = 'block';
    passportNumberLabel.style.marginBottom = '5px';
    
    const passportNumberInput = document.createElement('input');
    passportNumberInput.type = 'text';
    passportNumberInput.id = 'passportNumber';
    passportNumberInput.name = 'passportNumber';
    passportNumberInput.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    `;
    
    passportNumberGroup.appendChild(passportNumberLabel);
    passportNumberGroup.appendChild(passportNumberInput);
    
    // Passport Expiry Date field
    const passportExpiryGroup = document.createElement('div');
    passportExpiryGroup.className = 'form-group';
    
    const passportExpiryLabel = document.createElement('label');
    passportExpiryLabel.htmlFor = 'passportExpiry';
    passportExpiryLabel.innerText = 'Passport Expiry Date:';
    passportExpiryLabel.style.display = 'block';
    passportExpiryLabel.style.marginBottom = '5px';
    
    const passportExpiryInput = document.createElement('input');
    passportExpiryInput.type = 'date';
    passportExpiryInput.id = 'passportExpiry';
    passportExpiryInput.name = 'passportExpiry';
    passportExpiryInput.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    `;
    
    passportExpiryGroup.appendChild(passportExpiryLabel);
    passportExpiryGroup.appendChild(passportExpiryInput);
    
    // Add passport fields to passport section
    passportSection.appendChild(passportTitle);
    passportSection.appendChild(passportNumberGroup);
    passportSection.appendChild(passportExpiryGroup);
    
    // Domestic Terms Section (initially hidden)
    const domesticTermsSection = document.createElement('div');
    domesticTermsSection.id = 'domestic-terms-section';
    domesticTermsSection.style.display = 'none';
    domesticTermsSection.style.marginTop = '20px';
    domesticTermsSection.style.padding = '15px';
    domesticTermsSection.style.border = '1px solid #ddd';
    domesticTermsSection.style.borderRadius = '5px';
    domesticTermsSection.style.backgroundColor = '#f9f9f9';
    
    const domesticTermsTitle = document.createElement('h3');
    domesticTermsTitle.innerText = 'Domestic Trip Terms';
    domesticTermsTitle.style.marginBottom = '15px';
    
    const domesticTermsList = document.createElement('ul');
    domesticTermsList.style.paddingLeft = '20px';
    
    const domesticTerms = [
      'I confirm that all details provided are accurate and complete.',
      'I understand that I am responsible for arranging my own travel to the meeting point.',
      'I agree to follow all trip guidelines and schedules provided by the trip organizer.',
      'I confirm that I am physically fit to participate in all planned activities.'
    ];
    
    domesticTerms.forEach(term => {
      const termItem = document.createElement('li');
      termItem.innerText = term;
      termItem.style.marginBottom = '8px';
      domesticTermsList.appendChild(termItem);
    });
    
    // Add agreement checkbox
    const domesticAgreementGroup = document.createElement('div');
    domesticAgreementGroup.className = 'form-group';
    domesticAgreementGroup.style.marginTop = '15px';
    domesticAgreementGroup.style.display = 'flex';
    domesticAgreementGroup.style.alignItems = 'flex-start';
    
    const domesticAgreementCheckbox = document.createElement('input');
    domesticAgreementCheckbox.type = 'checkbox';
    domesticAgreementCheckbox.id = 'domesticAgreement';
    domesticAgreementCheckbox.name = 'domesticAgreement';
    domesticAgreementCheckbox.style.marginRight = '10px';
    domesticAgreementCheckbox.style.marginTop = '5px';
    
    const domesticAgreementLabel = document.createElement('label');
    domesticAgreementLabel.htmlFor = 'domesticAgreement';
    domesticAgreementLabel.innerText = 'I have read and agree to the terms and conditions for this domestic trip.';
    
    domesticAgreementGroup.appendChild(domesticAgreementCheckbox);
    domesticAgreementGroup.appendChild(domesticAgreementLabel);
    
    // Add terms to domestic section
    domesticTermsSection.appendChild(domesticTermsTitle);
    domesticTermsSection.appendChild(domesticTermsList);
    domesticTermsSection.appendChild(domesticAgreementGroup);
    
    // Add trip type options toggle functionality
    internationalInput.addEventListener('change', function() {
      if (this.checked) {
        passportSection.style.display = 'block';
        domesticTermsSection.style.display = 'none';
      }
    });
    
    domesticInput.addEventListener('change', function() {
      if (this.checked) {
        passportSection.style.display = 'none';
        domesticTermsSection.style.display = 'block';
      }
    });
    
    // Add fields to form
    form.appendChild(tripTypeGroup);
    form.appendChild(passportSection);
    form.appendChild(domesticTermsSection);
    
    // Add form to step container
    stepContainer.appendChild(stepTitle);
    stepContainer.appendChild(form);
    
    return stepContainer;
  }
  
  // Function to create Review & Submit step
  // Function to create Review & Submit step
  function createReviewStep() {
    const stepContainer = document.createElement('div');
    stepContainer.className = 'step-content review-step';
    
    const stepTitle = document.createElement('h2');
    stepTitle.innerText = 'Review Your Information';
    stepTitle.style.marginBottom = '20px';
    
    const reviewContent = document.createElement('div');
    reviewContent.id = 'review-content';
    reviewContent.style.cssText = `
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px;
      background-color: #f9f9f9;
    `;
    
    // Personal Info review section
    const personalInfoSection = document.createElement('div');
    personalInfoSection.className = 'review-section';
    
    const personalInfoTitle = document.createElement('h3');
    personalInfoTitle.innerText = 'Personal Information';
    personalInfoTitle.style.marginBottom = '10px';
    
    const personalInfoList = document.createElement('ul');
    personalInfoList.id = 'personal-info-review';
    personalInfoList.style.listStyleType = 'none';
    personalInfoList.style.padding = '0';
    personalInfoList.style.margin = '0 0 20px 0';
    
    personalInfoSection.appendChild(personalInfoTitle);
    personalInfoSection.appendChild(personalInfoList);
    
    // Trip Information review section
    const tripInfoSection = document.createElement('div');
    tripInfoSection.className = 'review-section';
    
    const tripInfoTitle = document.createElement('h3');
    tripInfoTitle.innerText = 'Trip Information';
    tripInfoTitle.style.marginBottom = '10px';
    
    const tripInfoList = document.createElement('ul');
    tripInfoList.id = 'trip-info-review';
    tripInfoList.style.listStyleType = 'none';
    tripInfoList.style.padding = '0';
    tripInfoList.style.margin = '0 0 20px 0';
    
    tripInfoSection.appendChild(tripInfoTitle);
    tripInfoSection.appendChild(tripInfoList);
    
    // Terms & Conditions section
    const termsSection = document.createElement('div');
    termsSection.className = 'terms-section';
    
    const termsTitle = document.createElement('h3');
    termsTitle.innerText = 'Terms & Conditions';
    termsTitle.style.marginBottom = '10px';
    
    const termsContent = document.createElement('div');
    termsContent.id = 'terms-content';
    termsContent.style.maxHeight = '200px';
    termsContent.style.overflowY = 'auto';
    termsContent.style.padding = '10px';
    termsContent.style.border = '1px solid #ddd';
    termsContent.style.borderRadius = '4px';
    termsContent.style.marginBottom = '15px';
    
    const internationalTerms = document.createElement('div');
    internationalTerms.id = 'international-terms';
    internationalTerms.style.display = 'none';
    
    const internationalTermsList = document.createElement('ul');
    
    const intTerms = [
      'I confirm that all passport information provided is accurate and up-to-date.',
      'I understand that I am responsible for obtaining any required visas or travel authorizations.',
      'I confirm that I have adequate travel insurance that covers international travel.',
      'I understand that I must comply with all immigration and customs regulations.',
      'I agree to follow all trip guidelines and schedules provided by the trip organizer.'
    ];
    
    intTerms.forEach(term => {
      const termItem = document.createElement('li');
      termItem.innerText = term;
      termItem.style.marginBottom = '8px';
      internationalTermsList.appendChild(termItem);
    });
    
    internationalTerms.appendChild(internationalTermsList);
    
    const domesticTermsReview = document.createElement('div');
    domesticTermsReview.id = 'domestic-terms-review';
    domesticTermsReview.style.display = 'none';
    
    const domesticTermsListReview = document.createElement('ul');
    
    const domTerms = [
      'I confirm that all details provided are accurate and complete.',
      'I understand that I am responsible for arranging my own travel to the meeting point.',
      'I agree to follow all trip guidelines and schedules provided by the trip organizer.',
      'I confirm that I am physically fit to participate in all planned activities.'
    ];
    
    domTerms.forEach(term => {
      const termItem = document.createElement('li');
      termItem.innerText = term;
      termItem.style.marginBottom = '8px';
      domesticTermsListReview.appendChild(termItem);
    });
    
    domesticTermsReview.appendChild(domesticTermsListReview);
    
    // Final agreement checkbox
    const finalAgreementGroup = document.createElement('div');
    finalAgreementGroup.className = 'form-group';
    finalAgreementGroup.style.marginTop = '15px';
    finalAgreementGroup.style.display = 'flex';
    finalAgreementGroup.style.alignItems = 'flex-start';
    
    const finalAgreementCheckbox = document.createElement('input');
    finalAgreementCheckbox.type = 'checkbox';
    finalAgreementCheckbox.id = 'finalAgreement';
    finalAgreementCheckbox.name = 'finalAgreement';
    finalAgreementCheckbox.required = true;
    finalAgreementCheckbox.style.marginRight = '10px';
    finalAgreementCheckbox.style.marginTop = '5px';
    
    const finalAgreementLabel = document.createElement('label');
    finalAgreementLabel.htmlFor = 'finalAgreement';
    finalAgreementLabel.innerText = 'I confirm that all information provided is accurate and I agree to the terms and conditions.';
    
    finalAgreementGroup.appendChild(finalAgreementCheckbox);
    finalAgreementGroup.appendChild(finalAgreementLabel);
    
    // Add all sections to terms content
    termsContent.appendChild(internationalTerms);
    termsContent.appendChild(domesticTermsReview);
    
    // Add terms to terms section
    termsSection.appendChild(termsTitle);
    termsSection.appendChild(termsContent);
    termsSection.appendChild(finalAgreementGroup);
    
    // Add all sections to review content
    reviewContent.appendChild(personalInfoSection);
    reviewContent.appendChild(tripInfoSection);
    reviewContent.appendChild(termsSection);
    
    // Add everything to the step container
    stepContainer.appendChild(stepTitle);
    stepContainer.appendChild(reviewContent);
    
    return stepContainer;
  }// Function to validate each step's inputs
  function validateStep(stepIndex, formData, tripData) {
    if (stepIndex === 0) {
      // Validate Personal Info step
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const age = document.getElementById('age').value;
      const gender = document.querySelector('input[name="gender"]:checked')?.value;
      
      if (!name || !email || !age || !gender) {
        alert('Please fill in all required fields.');
        return false;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
      }
      
      // Validate age is a number between 18 and 100
      if (isNaN(age) || age < 18 || age > 100) {
        alert('Please enter a valid age between 18 and 100.');
        return false;
      }
      
      // Validate gender matches trip's gender preference if specified
      if (tripData.genderPreference && tripData.genderPreference !== 'Any' && 
          gender !== tripData.genderPreference.toLowerCase()) {
        alert(`This trip is only open to ${tripData.genderPreference} travelers.`);
        return false;
      }
      
      // Store the data
      formData.name = name;
      formData.email = email;
      formData.age = age;
      formData.gender = gender;
      
      return true;
    } 
    else if (stepIndex === 1) {
      // Validate Trip Type step
      const tripType = document.querySelector('input[name="tripType"]:checked')?.value;
      
      if (!tripType) {
        alert('Please select whether this is a domestic or international trip for you.');
        return false;
      }
      
      // For international trips, validate passport information
      if (tripType === 'international') {
        const passportNumber = document.getElementById('passportNumber').value;
        const passportExpiry = document.getElementById('passportExpiry').value;
        
        if (!passportNumber || !passportExpiry) {
          alert('Please provide your passport information.');
          return false;
        }
        
        // Check if passport is expired
        const today = new Date();
        const expiryDate = new Date(passportExpiry);
        
        if (expiryDate < today) {
          alert('Your passport has expired. Please renew your passport to join this trip.');
          return false;
        }
        
        // Check if passport expires before trip ends
        const tripEndDate = new Date(tripData.endDate);
        if (expiryDate < tripEndDate) {
          alert('Your passport will expire before the trip ends. Please renew your passport to join this trip.');
          return false;
        }
        
        // Store the data
        formData.tripType = tripType;
        formData.passportNumber = passportNumber;
        formData.passportExpiry = passportExpiry;
      } 
      else {
        // For domestic trips, check if agreement is checked
        const domesticAgreement = document.getElementById('domesticAgreement').checked;
        
        if (!domesticAgreement) {
          alert('Please agree to the terms and conditions to proceed.');
          return false;
        }
        
        // Store the data
        formData.tripType = tripType;
        formData.domesticAgreement = domesticAgreement;
      }
      
      return true;
    } 
    else if (stepIndex === 2) {
      // Validate Review step
      // This step is just for review, so always return true
      return true;
    }
    
    return false;
  }
  
  // Function to populate the review step with form data
  function populateReviewStep(formData) {
    const personalInfoReview = document.getElementById('personal-info-review');
    const tripInfoReview = document.getElementById('trip-info-review');
    
    // Clear previous content
    personalInfoReview.innerHTML = '';
    tripInfoReview.innerHTML = '';
    
    // Add personal info
    const personalItems = [
      { label: 'Name', value: formData.name },
      { label: 'Email', value: formData.email },
      { label: 'Age', value: formData.age },
      { label: 'Gender', value: formData.gender }
    ];
    
    personalItems.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
      li.style.marginBottom = '8px';
      personalInfoReview.appendChild(li);
    });
    
    // Add trip info
    const tripItems = [
      { label: 'Trip Destination', value: formData.tripDestination },
      { label: 'Trip Type', value: formData.tripType }
    ];
    
    // Add passport info if international
    if (formData.tripType === 'international') {
      tripItems.push(
        { label: 'Passport Number', value: formData.passportNumber },
        { label: 'Passport Expiry', value: new Date(formData.passportExpiry).toLocaleDateString() }
      );
      
      // Show international terms
      document.getElementById('international-terms').style.display = 'block';
      document.getElementById('domestic-terms-review').style.display = 'none';
    } else {
      // Show domestic terms
      document.getElementById('international-terms').style.display = 'none';
      document.getElementById('domestic-terms-review').style.display = 'block';
    }
    
    tripItems.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
      li.style.marginBottom = '8px';
      tripInfoReview.appendChild(li);
    });
  }
  
  // Function to submit the join request
  function submitJoinRequest(formData) {
    // Get the current user's email (if authenticated)
    const userEmail = formData.email;
    
    // Create a reference to where the join request will be stored
    const joinRequestRef = ref(database, `travel-bookings/${formData.creatorEmail}/public-trips/${formData.tripId}/joinRequests/${userEmail}`);
    
    // Create the join request data
    const joinRequestData = {
      name: formData.name,
      email: formData.email,
      age: formData.age,
      gender: formData.gender,
      tripType: formData.tripType,
      requestDate: new Date().toISOString(),
      status: 'pending' // Initial status
    };
    
    // Add passport info if international trip
    if (formData.tripType === 'international') {
      joinRequestData.passportNumber = formData.passportNumber;
      joinRequestData.passportExpiry = formData.passportExpiry;
    }
    
    // Set the data
    set(joinRequestRef, joinRequestData)
      .then(() => {
        // Close the modal
        const modal = document.querySelector('.stepper-modal');
        document.body.removeChild(modal);
        
        // Show success message
        alert('Your request to join this trip has been submitted successfully! The trip creator will review your request.');
      })
      .catch((error) => {
        alert('Error submitting join request: ' + error.message);
      });
  }
  
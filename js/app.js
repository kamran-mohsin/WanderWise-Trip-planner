class WanderWiseApp {
  constructor() {
    this.storageKey = "wanderwise_v7";
    this.state = this.loadState();
    this.currentDayIndex = 0;
    this.activeVaultTab = "checklist";
    this.exchangeRate = 278;
    this.selectedMemberAvatar = "👨‍💻";
    this.attachedProofFile = null;
    this.apiBase = "https://wanderwise-bavkend.onrender.com";
    this.chatbotOpen = false;
    this.initElements();
    this.bindEvents();
    this.syncInitialInputs();
    this.render();
    this.initScrollAnimations();
    this.initChatbot();
    this.checkPendingPaymentStatus();
  }
  loadState() {
    let state = null;
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        state = JSON.parse(saved);
      }
    } catch (e) {}

    if (!state || !state.trip) {
      state = JSON.parse(JSON.stringify(INITIAL_DATA));
    }

    if (state.trip) {
      state.trip.isPro = false;
      if (!state.trip.departureCity)
        state.trip.departureCity = "Islamabad, Pakistan";
      if (!state.trip.destination)
        state.trip.destination = "Swat Valley, Pakistan";
      if (!state.trip.startDate) state.trip.startDate = "2026-10-15";
      if (!state.trip.endDate) state.trip.endDate = "2026-10-20";
      if (!state.trip.datesDisplay)
        state.trip.datesDisplay = "Oct 15 - Oct 20 (5 Days)";
      if (!state.trip.totalBudget) state.trip.totalBudget = 250000;
      if (!state.trip.travelers) state.trip.travelers = 3;
    }

    if (!state.members || state.members.length === 0) {
      state.members = [
        {
          id: "m1",
          name: state.trip.userName || "Kamran Mohsin",
          avatar: "👨‍💻",
          isOrganizer: true,
        },
        { id: "m2", name: "Ali Ahmed", avatar: "🧗", isOrganizer: false },
        { id: "m3", name: "Sara Khan", avatar: "👩‍🦰", isOrganizer: false },
      ];
    }

    if (!state.expenses || state.expenses.length === 0) {
      state.expenses = [
        {
          id: "e1",
          title: "Transport / Fuel Advance",
          amount: 18500,
          payerId: "m1",
          category: "transport",
          date: "15 Oct 2026",
        },
        {
          id: "e2",
          title: "Traditional Trout Fish Dinner",
          amount: 11000,
          payerId: "m2",
          category: "food",
          date: "16 Oct 2026",
        },
      ];
    }

    if (!state.itineraryDays || state.itineraryDays.length === 0) {
      const result = generateDynamicItinerary(
        state.trip.destination || "Swat Valley, Pakistan",
        state.trip.startDate || "2026-10-15",
        state.trip.endDate || "2026-10-20",
      );
      state.itineraryDays = result.days;
      state.trip.datesDisplay = result.datesDisplay;
    }

    return state;
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed to persist WanderWise state:", e);
    }
  }

  initElements() {
    this.navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    this.pageViews = document.querySelectorAll(".page-view");
    this.mobileToggleBtn = document.getElementById("mobile-toggle-btn");
    this.sidebar = document.getElementById("app-sidebar");
    this.pageTitleDisplay = document.getElementById("page-title-display");
    this.pageSubtitleDisplay = document.getElementById("page-subtitle-display");
    this.rainModeCheckbox = document.getElementById("rain-mode-checkbox");
    this.rainModeChip = document.getElementById("rain-mode-toggle");
    this.rainModeAlert = document.getElementById("rain-mode-alert");
    this.currPkrBtn = document.getElementById("curr-pkr");
    this.currUsdBtn = document.getElementById("curr-usd");
    this.meezanModal = document.getElementById("meezan-checkout-modal");
    this.expenseModal = document.getElementById("add-expense-modal");
    this.activityModal = document.getElementById("add-activity-modal");
    this.memberModal = document.getElementById("add-member-modal");
    this.budgetModal = document.getElementById("edit-budget-modal");
    this.howModal = document.getElementById("how-it-works-modal");
    this.receiptModal = document.getElementById("pro-receipt-modal");
    this.destSearchInput = document.getElementById("dest-search-input");
    this.destDropdown = document.getElementById("dest-dropdown-results");
    this.destClearBtn = document.getElementById("btn-clear-dest");
    this.inputStartDate = document.getElementById("input-start-date");
    this.inputEndDate = document.getElementById("input-end-date");
    this.inputBudget = document.getElementById("input-budget");
    this.inputTravelers = document.getElementById("input-travelers");
    this.toastContainer = document.getElementById("toast-container");
    this.confettiCanvas = document.getElementById("confetti-canvas");
    this.chatbotWindow = document.getElementById("chatbot-window");
    this.chatbotMessages = document.getElementById("chatbot-messages");
    this.chatbotInputEl = document.getElementById("chatbot-input");
    this.proActivationOverlay = document.getElementById(
      "pro-activation-overlay",
    );
    this.pendingPaymentBanner = document.getElementById(
      "pending-payment-banner",
    );
    this.inputUserName = document.getElementById("input-user-name");
    this.inputDepartureCity = document.getElementById("input-departure-city");
    this.bannerDepartureText = document.getElementById("banner-departure-text");
    this.btnShareWhatsapp = document.getElementById("btn-share-trip-whatsapp");
    this.btnApplyAiFund = document.getElementById("btn-apply-ai-fund");
    this.aiFundBox = document.getElementById("ai-fund-estimator-box");
  }

  syncInitialInputs() {
    if (this.destSearchInput)
      this.destSearchInput.value = this.state.trip.destination || "";
    if (this.inputStartDate)
      this.inputStartDate.value = this.state.trip.startDate || "";
    if (this.inputEndDate)
      this.inputEndDate.value = this.state.trip.endDate || "";
    if (this.inputBudget)
      this.inputBudget.value = this.state.trip.totalBudget || 25000;
    if (this.inputTravelers)
      this.inputTravelers.value = this.state.trip.travelers || 2;
    if (this.inputUserName)
      this.inputUserName.value = this.state.trip.userName || "";
    const depInput = document.getElementById("input-departure-city");
    if (depInput) depInput.value = this.state.trip.departureCity || "";
    if (this.bannerDepartureText)
      this.bannerDepartureText.textContent =
        this.state.trip.departureCity || "Not Set";
    this.updateAIFundDisplay();
  }

  bindEvents() {
    this.navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = item.getAttribute("data-view");
        this.switchView(targetView);
        if (window.innerWidth <= 768 && this.sidebar) {
          this.sidebar.classList.remove("open");
          const ov = document.getElementById("sidebar-overlay");
          if (ov) ov.classList.remove("active");
        }
      });
    });

    if (this.mobileToggleBtn) {
      this.mobileToggleBtn.addEventListener("click", () => {
        const isOpen = this.sidebar.classList.toggle("open");
        const overlay = document.getElementById("sidebar-overlay");
        if (overlay) overlay.classList.toggle("active", isOpen);
      });
    }

    const sidebarOverlay = document.getElementById("sidebar-overlay");
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", () => {
        if (this.sidebar) this.sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
      });
    }

    document.addEventListener("click", (e) => {
      if (
        this.sidebar &&
        this.sidebar.classList.contains("open") &&
        !e.target.closest(".sidebar") &&
        !e.target.closest("#mobile-toggle-btn") &&
        !e.target.closest("#sidebar-overlay")
      ) {
        this.sidebar.classList.remove("open");
        if (sidebarOverlay) sidebarOverlay.classList.remove("active");
      }
    });

    if (this.rainModeCheckbox) {
      this.rainModeCheckbox.addEventListener("change", (e) => {
        this.toggleRainMode(e.target.checked);
      });
    }

    const turnOffRainBtn = document.getElementById("btn-turn-off-rain");
    if (turnOffRainBtn) {
      turnOffRainBtn.addEventListener("click", () => {
        this.toggleRainMode(false);
      });
    }

    if (this.currPkrBtn && this.currUsdBtn) {
      this.currPkrBtn.addEventListener("click", () => this.setCurrency("PKR"));
      this.currUsdBtn.addEventListener("click", () => this.setCurrency("USD"));
    }

    if (this.destSearchInput) {
      this.destSearchInput.addEventListener("input", (e) => {
        this.handleDestinationSearch(e.target.value);
      });
      this.destSearchInput.addEventListener("focus", () => {
        this.handleDestinationSearch(this.destSearchInput.value);
      });
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".dest-search-wrap")) {
          if (this.destDropdown) this.destDropdown.classList.remove("active");
        }
      });
    }

    if (this.destClearBtn) {
      this.destClearBtn.addEventListener("click", () => {
        if (this.destSearchInput) {
          this.destSearchInput.value = "";
          this.destSearchInput.focus();
          this.handleDestinationSearch("");
        }
      });
    }

    const quickPills = document.querySelectorAll(
      ".quick-dest-pill:not(.quick-origin-pill)",
    );
    quickPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const dest = pill.getAttribute("data-dest");
        const dep = (
          this.state.trip.departureCity ||
          (document.getElementById("input-departure-city")
            ? document.getElementById("input-departure-city").value.trim()
            : "")
        ).trim();
        if (!dep) {
          this.showToast(
            "⚠️ Please enter or select your Departure City (where you start from) first!",
          );
          const depEl = document.getElementById("input-departure-city");
          if (depEl) {
            depEl.focus();
            depEl.scrollIntoView({ behavior: "smooth", block: "center" });
            depEl.style.borderColor = "#f43f5e";
            depEl.style.boxShadow = "0 0 15px rgba(244, 63, 94, 0.4)";
            setTimeout(() => {
              depEl.style.borderColor = "";
              depEl.style.boxShadow = "";
            }, 2500);
          }
          return;
        }
        const cleanDep = dep.toLowerCase().split(",")[0].trim();
        const cleanDest = dest.toLowerCase().split(",")[0].trim();
        if (
          cleanDep &&
          cleanDest &&
          (cleanDep === cleanDest ||
            cleanDep.includes(cleanDest) ||
            cleanDest.includes(cleanDep))
        ) {
          this.showToast(
            `⚠️ Departure city (${dep}) and destination (${dest}) cannot be the same! Choose a different destination.`,
          );
          return;
        }
        this.applyDestinationAndDates(
          dest,
          this.state.trip.startDate,
          this.state.trip.endDate,
        );
      });
    });

    // Departure city origin pills
    const originPills = document.querySelectorAll(".quick-origin-pill");
    originPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const city = pill.getAttribute("data-city");
        const depInput = document.getElementById("input-departure-city");
        if (depInput) depInput.value = city;
        this.state.trip.departureCity = city;
        if (this.bannerDepartureText)
          this.bannerDepartureText.textContent = city;
        this.saveState();
        this.updateAIFundDisplay();
        this.showToast(`🚩 Departure city set to: ${city}`);
      });
    });

    // Auto-detect location button
    const autoDetectBtn = document.getElementById("btn-auto-detect-location");
    if (autoDetectBtn) {
      autoDetectBtn.addEventListener("click", () => {
        const depInput = document.getElementById("input-departure-city");
        const badge = document.getElementById("detected-loc-badge");
        autoDetectBtn.innerHTML = "<span>📡 Detecting...</span>";
        autoDetectBtn.disabled = true;
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                );
                const data = await res.json();
                const city =
                  data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  data.address.county ||
                  "Your Location";
                const country = data.address.country || "Pakistan";
                const fullCity = `${city}, ${country}`;
                if (depInput) depInput.value = fullCity;
                if (badge) badge.style.display = "inline-flex";
                this.state.trip.departureCity = fullCity;
                this.saveState();
                this.showToast(`📍 Location detected: ${fullCity}`);
              } catch (e) {
                this.showToast(
                  "⚠️ Location detected but city lookup failed. Please enter manually.",
                );
              } finally {
                autoDetectBtn.innerHTML = "<span>📡 Auto-Detect My City</span>";
                autoDetectBtn.disabled = false;
              }
            },
            (err) => {
              autoDetectBtn.innerHTML = "<span>📡 Auto-Detect My City</span>";
              autoDetectBtn.disabled = false;
              this.showToast(
                "⚠️ Location access denied. Please enter your city manually.",
              );
            },
            { timeout: 8000 },
          );
        } else {
          autoDetectBtn.innerHTML = "<span>📡 Auto-Detect My City</span>";
          autoDetectBtn.disabled = false;
          this.showToast(
            "⚠️ Geolocation not supported. Please type your city manually.",
          );
        }
      });
    }

    // Save user name on input change
    const userNameInput = document.getElementById("input-user-name");
    if (userNameInput) {
      userNameInput.addEventListener("input", (e) => {
        const name = e.target.value.trim();
        this.state.trip.userName = name;
        if (this.state.members && this.state.members[0]) {
          this.state.members[0].name = name || "Trip Organizer";
        }
        const sideUser = document.getElementById("sidebar-user-name");
        if (sideUser) sideUser.textContent = name || "Trip Organizer";
        this.saveState();
      });
    }

    // Save departure city on input change
    const depCityInput = document.getElementById("input-departure-city");
    if (depCityInput) {
      depCityInput.addEventListener("input", (e) => {
        const city = e.target.value.trim();
        this.state.trip.departureCity = city;
        if (this.bannerDepartureText)
          this.bannerDepartureText.textContent = city || "Not Set";
        this.saveState();
        this.updateAIFundDisplay();
      });
    }

    if (this.inputTravelers) {
      this.inputTravelers.addEventListener("change", (e) => {
        this.state.trip.travelers = Number(e.target.value) || 2;
        this.saveState();
        this.updateAIFundDisplay();
        this.renderBudget();
      });
    }

    if (this.btnShareWhatsapp) {
      this.btnShareWhatsapp.addEventListener("click", () =>
        this.shareTripWhatsApp(),
      );
    }

    if (this.btnApplyAiFund) {
      this.btnApplyAiFund.addEventListener("click", () => this.applyAIFund());
    }

    if (this.inputStartDate && this.inputEndDate) {
      const handleDateChange = () => {
        const s = this.inputStartDate.value;
        const e = this.inputEndDate.value;
        if (s && e) {
          this.applyDestinationAndDates(this.state.trip.destination, s, e);
        }
      };
      this.inputStartDate.addEventListener("change", handleDateChange);
      this.inputEndDate.addEventListener("change", handleDateChange);
    }

    if (this.inputBudget) {
      this.inputBudget.addEventListener("input", (e) => {
        const val = Number(e.target.value) || 0;
        if (val > 0) {
          this.state.trip.totalBudget = val;
          this.saveState();
          this.renderBudget();
          this.updateBudgetSyncElements();
          this.updateAIFundDisplay();
        }
      });
    }

    const saveQuizBtn = document.getElementById("btn-save-quiz-next");
    if (saveQuizBtn) {
      saveQuizBtn.addEventListener("click", () =>
        this.saveTripDetailsAndProceed(),
      );
    }

    const heroExploreBtn = document.getElementById("btn-hero-explore");
    if (heroExploreBtn) {
      heroExploreBtn.addEventListener("click", () => {
        this.switchView("view-itinerary");
      });
    }

    const heroDemoBtn = document.getElementById("btn-hero-demo");
    if (heroDemoBtn) {
      heroDemoBtn.addEventListener("click", () => {
        if (this.howModal) this.howModal.classList.add("active");
      });
    }

    const closeHowBtn = document.getElementById("btn-close-how-modal");
    const startHowBtn = document.getElementById("btn-how-start-now");
    if (closeHowBtn)
      closeHowBtn.addEventListener("click", () =>
        this.howModal.classList.remove("active"),
      );
    if (startHowBtn) {
      startHowBtn.addEventListener("click", () => {
        this.howModal.classList.remove("active");
        this.switchView("view-itinerary");
      });
    }

    const quickEditBudgetBtn = document.getElementById("btn-quick-edit-budget");
    const closeBudgetBtn = document.getElementById("btn-close-budget-modal");
    const saveBudgetModalBtn = document.getElementById("btn-save-budget-modal");

    if (quickEditBudgetBtn) {
      quickEditBudgetBtn.addEventListener("click", () => {
        const modalInput = document.getElementById("edit-budget-input");
        if (modalInput) modalInput.value = this.state.trip.totalBudget;
        this.budgetModal.classList.add("active");
      });
    }

    if (closeBudgetBtn) {
      closeBudgetBtn.addEventListener("click", () => {
        this.budgetModal.classList.remove("active");
      });
    }

    if (saveBudgetModalBtn) {
      saveBudgetModalBtn.addEventListener("click", () => {
        const modalInput = document.getElementById("edit-budget-input");
        const newBudget = Number(modalInput ? modalInput.value : 0) || 250000;
        if (newBudget <= 0) {
          this.showToast("⚠️ Please enter a valid total budget amount!");
          return;
        }
        this.state.trip.totalBudget = newBudget;
        if (this.inputBudget) this.inputBudget.value = newBudget;
        this.saveState();
        if (this.budgetModal) this.budgetModal.classList.remove("active");
        const bModal = document.getElementById("edit-budget-modal");
        if (bModal) bModal.classList.remove("active");
        this.renderBudget();
        this.updateBudgetSyncElements();
        this.showToast(
          `💰 Total trip budget updated to ${this.formatMoney(newBudget)}!`,
        );
      });
    }

    const tabChecklist = document.getElementById("tab-vault-checklist");
    const tabEmergency = document.getElementById("tab-vault-emergency");
    if (tabChecklist && tabEmergency) {
      tabChecklist.addEventListener("click", () =>
        this.switchVaultTab("checklist"),
      );
      tabEmergency.addEventListener("click", () =>
        this.switchVaultTab("emergency"),
      );
    }

    const btnCheckAll = document.getElementById("btn-check-all-items");
    const btnResetItems = document.getElementById("btn-reset-items");
    if (btnCheckAll)
      btnCheckAll.addEventListener("click", () =>
        this.toggleAllChecklistItems(true),
      );
    if (btnResetItems)
      btnResetItems.addEventListener("click", () =>
        this.toggleAllChecklistItems(false),
      );

    const btnPrintSheet = document.getElementById("btn-print-one-sheet");
    if (btnPrintSheet) {
      btnPrintSheet.addEventListener("click", () => {
        window.print();
      });
    }

    const openPaymentModalBtns = [
      document.getElementById("header-upgrade-btn"),
      document.getElementById("quick-pro-btn"),
      document.getElementById("btn-open-payment-modal"),
    ];

    openPaymentModalBtns.forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", () => this.openMeezanModal());
      }
    });

    const closeMeezanBtn = document.getElementById("btn-close-meezan-modal");
    if (closeMeezanBtn) {
      closeMeezanBtn.addEventListener("click", () => {
        this.meezanModal.classList.remove("active");
        this.resetPaymentModal();
      });
    }

    const copyAccBtns = [
      document.getElementById("btn-copy-meezan-number"),
      document.getElementById("btn-copy-number-plan"),
    ];

    copyAccBtns.forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", () => {
          this.copyToClipboard(
            "03046942398",
            "Meezan Bank number 03046942398 copied!",
          );
        });
      }
    });

    const proofUploadBox = document.getElementById("proof-upload-box");
    const proofFileInput = document.getElementById("proof-file-input");

    if (proofUploadBox && proofFileInput) {
      proofUploadBox.addEventListener("click", () => {
        proofFileInput.click();
      });

      proofUploadBox.addEventListener("dragover", (e) => {
        e.preventDefault();
        proofUploadBox.style.borderColor = "var(--primary-emerald)";
        proofUploadBox.style.background = "rgba(16, 185, 129, 0.08)";
      });

      proofUploadBox.addEventListener("dragleave", () => {
        proofUploadBox.style.borderColor = "rgba(16, 185, 129, 0.4)";
        proofUploadBox.style.background = "rgba(16, 185, 129, 0.04)";
      });

      proofUploadBox.addEventListener("drop", (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) this.handleProofFileAttach(file);
      });

      proofFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) this.handleProofFileAttach(file);
      });
    }

    const confirmPaymentBtn = document.getElementById("btn-confirm-payment");
    if (confirmPaymentBtn) {
      confirmPaymentBtn.addEventListener("click", () =>
        this.handleRealisticPaymentVerification(),
      );
    }

    const closeReceiptBtn = document.getElementById("btn-close-receipt-modal");
    const viewProBtn = document.getElementById("btn-receipt-view-features");
    const printReceiptBtn = document.getElementById("btn-receipt-print");

    if (closeReceiptBtn)
      closeReceiptBtn.addEventListener("click", () =>
        this.receiptModal.classList.remove("active"),
      );
    if (viewProBtn) {
      viewProBtn.addEventListener("click", () => {
        this.receiptModal.classList.remove("active");
        this.switchView("view-itinerary");
      });
    }
    if (printReceiptBtn) {
      printReceiptBtn.addEventListener("click", () => {
        window.print();
      });
    }

    const openMemberBtn = document.getElementById("btn-open-add-member-modal");
    const closeMemberBtn = document.getElementById("btn-close-member-modal");
    const saveMemberBtn = document.getElementById("btn-save-new-member");

    if (openMemberBtn)
      openMemberBtn.addEventListener("click", () => this.openAddMemberModal());
    if (closeMemberBtn)
      closeMemberBtn.addEventListener("click", () =>
        this.memberModal.classList.remove("active"),
      );
    if (saveMemberBtn)
      saveMemberBtn.addEventListener("click", () => this.saveNewMember());

    const avatarBtns = document.querySelectorAll(".avatar-choice-btn");
    avatarBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        avatarBtns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedMemberAvatar = btn.getAttribute("data-avatar");
      });
    });

    const openExpBtn = document.getElementById("btn-open-expense-modal");
    const closeExpBtn = document.getElementById("btn-close-expense-modal");
    const saveExpBtn = document.getElementById("btn-save-new-expense");

    if (openExpBtn)
      openExpBtn.addEventListener("click", () => this.openExpenseModal());
    if (closeExpBtn)
      closeExpBtn.addEventListener("click", () =>
        this.expenseModal.classList.remove("active"),
      );
    if (saveExpBtn)
      saveExpBtn.addEventListener("click", () => this.saveNewExpense());

    const openActBtn = document.getElementById("btn-add-activity-modal");
    const closeActBtn = document.getElementById("btn-close-activity-modal");
    const saveActBtn = document.getElementById("btn-save-new-activity");

    if (openActBtn)
      openActBtn.addEventListener("click", () =>
        this.activityModal.classList.add("active"),
      );
    if (closeActBtn)
      closeActBtn.addEventListener("click", () =>
        this.activityModal.classList.remove("active"),
      );
    if (saveActBtn)
      saveActBtn.addEventListener("click", () => this.saveNewActivity());

    const saveJournalBtn = document.getElementById("btn-save-journal");
    if (saveJournalBtn) {
      saveJournalBtn.addEventListener("click", () => {
        const text = document.getElementById("daily-journal-notes").value;
        const currentDay = this.state.itineraryDays[this.currentDayIndex];
        if (currentDay) {
          currentDay.journalNotes = text;
          this.saveState();
          this.showToast(`📝 Notes saved for Day ${currentDay.dayNumber}!`);
        }
      });
    }

    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });
    });

    const fabBtn = document.getElementById("chatbot-fab-btn");
    const closeBot = document.getElementById("chatbot-close-btn");
    const sendBtn = document.getElementById("chatbot-send-btn");

    if (fabBtn) {
      fabBtn.addEventListener("click", () => {
        this.chatbotOpen = !this.chatbotOpen;
        if (this.chatbotWindow)
          this.chatbotWindow.classList.toggle("open", this.chatbotOpen);
        if (this.chatbotOpen && this.chatbotInputEl) {
          setTimeout(() => this.chatbotInputEl.focus(), 300);
        }
      });
    }

    if (closeBot) {
      closeBot.addEventListener("click", () => {
        this.chatbotOpen = false;
        if (this.chatbotWindow) this.chatbotWindow.classList.remove("open");
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener("click", () => this.sendChatMessage());
    }

    if (this.chatbotInputEl) {
      this.chatbotInputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.sendChatMessage();
      });
    }

    document.querySelectorAll(".quick-reply-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const msg = btn.getAttribute("data-msg");
        if (msg && this.chatbotInputEl) {
          this.chatbotInputEl.value = msg;
          this.sendChatMessage();
        }
      });
    });

    const proOverlayCloseBtn = document.getElementById("btn-close-pro-overlay");
    if (proOverlayCloseBtn) {
      proOverlayCloseBtn.addEventListener("click", () => {
        if (this.proActivationOverlay)
          this.proActivationOverlay.classList.remove("active");
        this.switchView("view-itinerary");
      });
    }

    const checkStatusBtn = document.getElementById("btn-check-payment-status");
    if (checkStatusBtn) {
      checkStatusBtn.addEventListener("click", () =>
        this.manualCheckPaymentStatus(),
      );
    }

    const adminResetProBtn = document.getElementById("btn-admin-reset-pro");
    if (adminResetProBtn) {
      adminResetProBtn.addEventListener("click", () => {
        if (
          confirm(
            "Aap apna PRO plan remove karke Free plan par wapis jana chahte hain? Is se aap dobara upgrade process test kar sakenge.",
          )
        ) {
          this.resetProPlanToFree();
        }
      });
    }
  }

  handleProofFileAttach(file) {
    this.attachedProofFile = file;
    const promptEl = document.getElementById("proof-upload-prompt");
    const previewContainer = document.getElementById("proof-preview-container");
    const previewImg = document.getElementById("proof-preview-img");
    const fileNameEl = document.getElementById("proof-file-name");

    if (promptEl) promptEl.style.display = "none";
    if (previewContainer) previewContainer.style.display = "flex";
    if (fileNameEl) fileNameEl.textContent = file.name;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (re) => {
        if (previewImg) previewImg.src = re.target.result;
      };
      reader.readAsDataURL(file);
    }
    this.showToast(
      `📸 Receipt "${file.name}" attached! Now enter your sender number below.`,
    );
  }

  resetPaymentModal() {
    const promptEl = document.getElementById("proof-upload-prompt");
    const previewContainer = document.getElementById("proof-preview-container");
    const trxInput = document.getElementById("input-trx-id");
    const loaderBox = document.getElementById("verification-progress-box");
    const confirmBtn = document.getElementById("btn-confirm-payment");

    if (promptEl) promptEl.style.display = "block";
    if (previewContainer) previewContainer.style.display = "none";
    if (trxInput) trxInput.value = "";
    if (loaderBox) loaderBox.style.display = "none";
    if (confirmBtn) confirmBtn.disabled = false;
    this.attachedProofFile = null;
  }

  applyDestinationAndDates(dest, startDate, endDate) {
    if (!dest) return;
    if (!startDate) {
      startDate =
        (this.inputStartDate && this.inputStartDate.value) ||
        (() => {
          const d = new Date();
          const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
          return z.toISOString().slice(0, 10);
        })();
    }
    if (!endDate) {
      endDate =
        (this.inputEndDate && this.inputEndDate.value) ||
        new Date(new Date(startDate).getTime() + 4 * 86400000)
          .toISOString()
          .slice(0, 10);
    }
    if (new Date(endDate) < new Date(startDate)) endDate = startDate;
    if (this.inputStartDate) this.inputStartDate.value = startDate;
    if (this.inputEndDate) this.inputEndDate.value = endDate;

    this.state.trip.destination = dest;
    this.state.trip.startDate = startDate;
    this.state.trip.endDate = endDate;

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    this.state.trip.datesDisplay = `${sDate.getDate()} ${monthNames[sDate.getMonth()]} - ${eDate.getDate()} ${monthNames[eDate.getMonth()]} ${eDate.getFullYear()}`;

    const result = generateDynamicItinerary(dest, startDate, endDate);
    this.state.itineraryDays = result.days;
    this.state.trip.hotelName = result.hotelName;
    this.state.trip.hotelLocalScript = result.hotelLocalScript;
    this.state.trip.bookingRef = result.bookingRef;
    this.state.trip.weather = result.weather;
    this.state.trip.totalDays = result.totalDays;

    if (this.currentDayIndex >= this.state.itineraryDays.length) {
      this.currentDayIndex = 0;
    }

    if (this.destSearchInput) this.destSearchInput.value = dest;
    if (this.destDropdown) this.destDropdown.classList.remove("active");

    this.saveState();
    this.render();
    this.showToast(`🗺️ Trip updated for "${dest}" (${result.totalDays} Days)!`);
  }

  handleDestinationSearch(query) {
    if (!this.destDropdown) return;
    const q = (query || "").toLowerCase().trim();

    if (this.destClearBtn) {
      this.destClearBtn.style.display = q ? "block" : "none";
    }

    const matches = this.state.popularDestinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q),
    );

    this.destDropdown.innerHTML = "";

    if (q && !matches.some((m) => m.name.toLowerCase() === q)) {
      const isPro = this.state.trip.isPro || false;
      const customItem = document.createElement("div");
      customItem.className = "dest-result-item";
      if (isPro) {
        customItem.innerHTML = `
          <div class="dest-item-left">
            <span style="font-size: 1.2rem;">✨</span>
            <div>
              <div class="dest-item-name">"${query}" (Custom Destination)</div>
              <div class="dest-item-region">Click to set your custom travel itinerary</div>
            </div>
          </div>
          <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7;">SELECT</span>
        `;
        customItem.addEventListener("click", () => {
          const s =
            this.state.trip.startDate || new Date().toISOString().slice(0, 10);
          const e =
            this.state.trip.endDate ||
            new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
          this.applyDestinationAndDates(query, s, e);
        });
      } else {
        customItem.innerHTML = `
          <div class="dest-item-left">
            <span style="font-size: 1.2rem;">🔒</span>
            <div>
              <div class="dest-item-name">"${query}" (Custom Destination)</div>
              <div class="dest-item-region" style="color: #fda4af;">👑 PRO Feature — Upgrade to unlock custom destinations (Rs 100 only)</div>
            </div>
          </div>
          <span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5;">PRO ONLY</span>
        `;
        customItem.addEventListener("click", () => {
          this.destDropdown.classList.remove("active");
          this.showToast(
            "🔒 Custom destinations are a PRO feature! Upgrade for Rs 100 only.",
          );
          this.switchView("view-pro");
        });
      }
      this.destDropdown.appendChild(customItem);
    }

    matches.forEach((item) => {
      const row = document.createElement("div");
      row.className = "dest-result-item";
      row.innerHTML = `
        <div class="dest-item-left">
          <span style="font-size: 1.25rem;">${item.icon}</span>
          <div>
            <div class="dest-item-name">${item.name}</div>
            <div class="dest-item-region">${item.region} • ${item.days} Days Suggested</div>
          </div>
        </div>
        <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700;">Select ➔</span>
      `;
      row.addEventListener("click", () => {
        this.applyDestinationAndDates(
          item.name,
          this.state.trip.startDate,
          this.state.trip.endDate,
        );
      });
      this.destDropdown.appendChild(row);
    });

    if (this.destDropdown.children.length > 0) {
      this.destDropdown.classList.add("active");
    }
  }

  switchView(viewId) {
    this.pageViews.forEach((v) => {
      v.classList.remove("active");
    });

    this.navItems.forEach((item) => {
      if (item.getAttribute("data-view") === viewId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    const targetEl = document.getElementById(viewId);
    if (targetEl) {
      targetEl.classList.add("active");
      const mainContent = document.querySelector(".main-content");
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => this.triggerScrollAnimations(), 100);
    }

    const titles = {
      "view-home": {
        title: "Trip Setup & Vibe Quiz",
        sub: "Search any destination, pick dates, set your budget & travel vibe",
      },
      "view-itinerary": {
        title: "Smart Itinerary & Fatigue Engine",
        sub: "Day-by-day schedule with real-time energy tracking & rain backups (12-Hour Format)",
      },
      "view-budget": {
        title: "FairShare Budget & Debt Simplifier",
        sub: "Track group expenses & settle debts with minimum transfers",
      },
      "view-vault": {
        title: "Travel Vault & Offline One-Sheet",
        sub: "Packed gear checklist and printable emergency survival card",
      },
      "view-radar": {
        title: "Live Weather & Destination Radar",
        sub: "Doppler precipitation scanner and real-time destination weather forecast",
      },
      "view-pro": {
        title: "WanderWise PRO Membership",
        sub: "Meezan Bank direct transfer & lifetime premium features — Rs 100 only (one-time)",
      },
    };

    if (titles[viewId]) {
      if (this.pageTitleDisplay)
        this.pageTitleDisplay.textContent = titles[viewId].title;
      if (this.pageSubtitleDisplay)
        this.pageSubtitleDisplay.textContent = titles[viewId].sub;
    }

    if (viewId === "view-pro") {
      this.renderProPricing();
      this.checkPendingPaymentStatus();
    } else if (viewId === "view-itinerary") {
      this.renderItinerary();
      this.renderFatigue();
    } else if (viewId === "view-budget") {
      this.renderBudget();
    } else if (viewId === "view-radar") {
      this.renderWeatherSchedule();
    }
  }

  toggleRainMode(isActive) {
    this.state.trip.rainMode = isActive;
    if (this.rainModeCheckbox) this.rainModeCheckbox.checked = isActive;

    if (isActive) {
      this.rainModeChip.classList.add("active");
      this.rainModeAlert.classList.add("active");
      this.showToast(
        "☔ Rain Mode ON: Outdoor activities swapped with sheltered alternatives!",
      );
    } else {
      this.rainModeChip.classList.remove("active");
      this.rainModeAlert.classList.remove("active");
      this.showToast("☀️ Rain Mode OFF: Outdoor scenic activities restored.");
    }

    this.saveState();
    this.renderItinerary();
    this.renderFatigue();
  }

  setCurrency(curr) {
    this.state.trip.currency = curr;
    this.state.trip.currencySymbol = curr === "PKR" ? "Rs" : "$";

    if (this.currPkrBtn && this.currUsdBtn) {
      if (curr === "PKR") {
        this.currPkrBtn.classList.add("active");
        this.currUsdBtn.classList.remove("active");
      } else {
        this.currUsdBtn.classList.add("active");
        this.currPkrBtn.classList.remove("active");
      }
    }

    document.querySelectorAll(".currency-symbol-label").forEach((el) => {
      el.textContent = this.state.trip.currencySymbol;
    });

    this.saveState();
    this.renderBudget();
    this.renderProPricing();
  }

  formatMoney(amountInPkr) {
    if (this.state.trip.currency === "USD") {
      const usd = Math.round(amountInPkr / this.exchangeRate);
      return `$${usd.toLocaleString()}`;
    }
    return `Rs ${Math.round(amountInPkr).toLocaleString()}`;
  }

  render() {
    this.renderTopAndSidebar();
    this.renderHomeQuiz();
    this.renderItinerary();
    this.renderFatigue();
    this.renderBudget();
    this.renderVault();
    this.renderEmergencyOneSheet();
    this.renderProPricing();
    this.renderWeatherSchedule();
  }

  updateBudgetSyncElements() {
    const statEl = document.getElementById("stat-total-budget");
    if (statEl)
      statEl.textContent = this.formatMoney(this.state.trip.totalBudget);
    const homeInput = document.getElementById("input-budget");
    if (homeInput) homeInput.value = this.state.trip.totalBudget;
  }

  renderTopAndSidebar() {
    const tripNameEl = document.getElementById("sidebar-trip-name");
    if (tripNameEl)
      tripNameEl.textContent = this.state.trip.destination.split(",")[0];

    const daysCountEl = document.getElementById("sidebar-days-count");
    if (daysCountEl)
      daysCountEl.textContent = `${this.state.itineraryDays.length} Days`;

    const userNameEl = document.getElementById("sidebar-user-name");
    if (userNameEl)
      userNameEl.textContent = this.state.trip.userName || "Kamran Mohsin";

    const bannerDest = document.getElementById("banner-dest-text");
    if (bannerDest) bannerDest.textContent = this.state.trip.destination;

    const bannerDates = document.getElementById("banner-dates-text");
    if (bannerDates) bannerDates.textContent = this.state.trip.datesDisplay;

    const bannerVibe = document.getElementById("banner-vibe-text");
    if (bannerVibe) bannerVibe.textContent = this.state.trip.vibe;

    const bannerVibeIcon = document.getElementById("banner-vibe-icon");
    if (bannerVibeIcon) {
      const vibeObj = this.state.vibeProfiles.find(
        (v) => v.id === this.state.trip.vibe,
      );
      if (vibeObj) bannerVibeIcon.textContent = vibeObj.icon;
    }

    const bannerWeather = document.getElementById("banner-weather-text");
    if (bannerWeather && this.state.trip.weather) {
      bannerWeather.textContent = `${this.state.trip.weather.tempC}°C • ${this.state.trip.weather.condition}`;
    }

    const radarSubtitle = document.getElementById("radar-dest-subtitle");
    if (radarSubtitle) {
      radarSubtitle.textContent = `Real-time precipitation scanner for ${this.state.trip.destination}`;
    }

    const isPro = this.state.trip.isPro || false;
    const tierBadge = document.getElementById("user-tier-label");
    const sideProBadge = document.getElementById("sidebar-pro-badge");

    if (tierBadge) {
      if (isPro) {
        tierBadge.textContent = "PRO LIFETIME 👑";
        tierBadge.classList.add("pro-tier");
      } else {
        tierBadge.textContent = "EXPLORER FREE";
        tierBadge.classList.remove("pro-tier");
      }
    }

    if (sideProBadge) {
      sideProBadge.textContent = isPro ? "ACTIVE 👑" : "UPGRADE";
    }

    if (this.rainModeCheckbox) {
      this.rainModeCheckbox.checked = this.state.trip.rainMode;
      if (this.state.trip.rainMode) {
        if (this.rainModeChip) this.rainModeChip.classList.add("active");
        if (this.rainModeAlert) this.rainModeAlert.classList.add("active");
      } else {
        if (this.rainModeChip) this.rainModeChip.classList.remove("active");
        if (this.rainModeAlert) this.rainModeAlert.classList.remove("active");
      }
    }

    const inputBudgetHome = document.getElementById("input-budget");
    if (inputBudgetHome) inputBudgetHome.value = this.state.trip.totalBudget;

    this.renderReadinessScore();
    this.updateCountdown();
  }

  renderReadinessScore() {
    const scoreVal = document.getElementById("readiness-score-val");
    const barFill = document.getElementById("readiness-bar-fill");
    const checklistEl = document.getElementById("readiness-checklist");
    if (!scoreVal || !barFill || !checklistEl) return;

    const checks = [
      {
        label: "🚩 Departure City",
        done: !!(
          this.state.trip.departureCity && this.state.trip.departureCity.trim()
        ),
      },
      {
        label: "📍 Destination Set",
        done: !!(
          this.state.trip.destination && this.state.trip.destination.trim()
        ),
      },
      {
        label: "📅 Dates Confirmed",
        done: !!(this.state.trip.startDate && this.state.trip.endDate),
      },
      {
        label: "💰 Budget Entered",
        done: !!(
          this.state.trip.totalBudget && this.state.trip.totalBudget > 0
        ),
      },
      { label: "👥 Members Added", done: this.state.members.length > 0 },
      { label: "🎭 Vibe Selected", done: !!this.state.trip.vibe },
      {
        label: "🎒 Packing Started",
        done:
          this.state.vaultCategories &&
          this.state.vaultCategories.some(
            (c) => c.items && c.items.some((i) => i.checked),
          ),
      },
      { label: "💸 Expenses Logged", done: this.state.expenses.length > 0 },
    ];

    const doneCount = checks.filter((c) => c.done).length;
    const pct = Math.round((doneCount / checks.length) * 100);

    scoreVal.textContent = `${pct}%`;
    scoreVal.style.color =
      pct >= 75 ? "#6ee7b7" : pct >= 40 ? "#fcd34d" : "#fca5a5";
    barFill.style.width = `${pct}%`;

    checklistEl.innerHTML = checks
      .map(
        (c) => `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(255,255,255,${c.done ? "0.06" : "0.02"});border:1px solid rgba(255,255,255,${c.done ? "0.1" : "0.04"});border-radius:8px;">
        <span style="font-size:1rem;">${c.done ? "✅" : "⬜"}</span>
        <span style="font-size:0.78rem;color:${c.done ? "#ffffff" : "var(--text-muted)"};">${c.label}</span>
      </div>
    `,
      )
      .join("");
  }

  updateCountdown() {
    const countdownEl = document.getElementById("sidebar-countdown");
    const daysEl = document.getElementById("countdown-days");
    if (!countdownEl || !daysEl) return;

    if (!this.state.trip.startDate) {
      countdownEl.style.display = "none";
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripDate = new Date(this.state.trip.startDate);
    tripDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));

    countdownEl.style.display = "block";
    if (diff > 0) {
      daysEl.textContent = diff;
      daysEl.style.color =
        diff <= 7 ? "#fca5a5" : diff <= 30 ? "#fcd34d" : "#6ee7b7";
      countdownEl.querySelector("div:last-child").textContent =
        `days until departure 🚀`;
    } else if (diff === 0) {
      daysEl.textContent = "TODAY";
      daysEl.style.color = "#6ee7b7";
      countdownEl.querySelector("div:last-child").textContent =
        `Trip starts today! 🎉`;
    } else {
      daysEl.textContent = Math.abs(diff);
      daysEl.style.color = "#67e8f9";
      countdownEl.querySelector("div:last-child").textContent =
        `days since trip started 🗺️`;
    }
  }

  renderHomeQuiz() {
    const container = document.getElementById("vibe-cards-container");
    if (!container) return;

    container.innerHTML = "";
    this.state.vibeProfiles.forEach((vibe) => {
      const isSelected = vibe.id === this.state.trip.vibe;
      const card = document.createElement("div");
      card.className = `vibe-card ${isSelected ? "selected" : ""}`;
      card.innerHTML = `
        <div class="vibe-top">
          <span class="vibe-icon">${vibe.icon}</span>
          ${isSelected ? '<span style="color: var(--primary-emerald); font-size: 0.8rem; font-weight: 800;">✓ Active</span>' : ""}
        </div>
        <div class="vibe-title">${vibe.title}</div>
        <div class="vibe-sub">${vibe.subtitle}</div>
      `;

      card.addEventListener("click", () => {
        this.state.trip.vibe = vibe.id;
        this.saveState();
        this.renderHomeQuiz();
        this.renderItinerary();
        this.renderFatigue();
        this.showToast(`✨ Travel Vibe set to "${vibe.title}"`);
      });

      container.appendChild(card);
    });

    const currentVibeObj = this.state.vibeProfiles.find(
      (v) => v.id === this.state.trip.vibe,
    );
    const feedbackText = document.getElementById("vibe-feedback-text");
    if (feedbackText && currentVibeObj) {
      feedbackText.textContent = `${currentVibeObj.title} Vibe: ${currentVibeObj.description} (${currentVibeObj.recommendedGapMinutes}-min rest gaps between activities).`;
    }
  }

  saveTripDetailsAndProceed() {
    let dest = this.destSearchInput
      ? this.destSearchInput.value.trim()
      : this.state.trip.destination || "Swat Valley, Pakistan";
    if (!dest) dest = this.state.trip.destination || "Swat Valley, Pakistan";

    const depCityInput = document.getElementById("input-departure-city");
    let departureCity = depCityInput
      ? depCityInput.value.trim()
      : this.state.trip.departureCity || "Islamabad, Pakistan";
    if (!departureCity) departureCity = "Islamabad, Pakistan";

    let start = this.inputStartDate
      ? this.inputStartDate.value
      : this.state.trip.startDate;
    let end = this.inputEndDate
      ? this.inputEndDate.value
      : this.state.trip.endDate;

    if (!start) start = "2026-10-15";
    if (!end) end = "2026-10-20";

    const budget = this.inputBudget
      ? Number(this.inputBudget.value) || 250000
      : this.state.trip.totalBudget || 250000;

    const travelers = this.inputTravelers
      ? Number(this.inputTravelers.value) || 2
      : this.state.trip.travelers || 2;

    this.state.trip.departureCity = departureCity;
    this.state.trip.destination = dest;
    this.state.trip.totalBudget = budget;
    this.state.trip.travelers = travelers;
    this.state.trip.startDate = start;
    this.state.trip.endDate = end;

    if (this.destSearchInput) this.destSearchInput.value = dest;
    if (depCityInput) depCityInput.value = departureCity;
    if (this.inputStartDate) this.inputStartDate.value = start;
    if (this.inputEndDate) this.inputEndDate.value = end;

    this.applyDestinationAndDates(dest, start, end);
    this.switchView("view-itinerary");
    this.showToast(
      `✅ Trip to "${dest}" configured! Welcome to Smart Itinerary.`,
    );
  }

  calculateAIFund(depCity, destCity, travelers = 2, totalDays = 4) {
    if (!depCity || !destCity) return null;
    const dep = depCity.toLowerCase();
    const dest = destCity.toLowerCase();

    let distanceKm = 280;
    if (dest.includes("swat")) {
      if (dep.includes("islamabad") || dep.includes("rawalpindi"))
        distanceKm = 245;
      else if (dep.includes("peshawar")) distanceKm = 170;
      else if (dep.includes("lahore")) distanceKm = 615;
      else if (dep.includes("faisalabad")) distanceKm = 520;
      else if (dep.includes("karachi")) distanceKm = 1650;
      else distanceKm = 350;
    } else if (dest.includes("hunza")) {
      if (dep.includes("islamabad") || dep.includes("rawalpindi"))
        distanceKm = 580;
      else if (dep.includes("lahore")) distanceKm = 950;
      else if (dep.includes("karachi")) distanceKm = 1980;
      else distanceKm = 650;
    } else if (dest.includes("skardu")) {
      if (dep.includes("islamabad") || dep.includes("rawalpindi"))
        distanceKm = 630;
      else if (dep.includes("lahore")) distanceKm = 1000;
      else if (dep.includes("karachi")) distanceKm = 2050;
      else distanceKm = 700;
    } else if (dest.includes("murree")) {
      if (dep.includes("islamabad") || dep.includes("rawalpindi"))
        distanceKm = 65;
      else if (dep.includes("lahore")) distanceKm = 430;
      else if (dep.includes("karachi")) distanceKm = 1460;
      else distanceKm = 150;
    } else if (dest.includes("kumrat")) {
      if (dep.includes("islamabad") || dep.includes("rawalpindi"))
        distanceKm = 370;
      else if (dep.includes("lahore")) distanceKm = 740;
      else distanceKm = 420;
    } else if (dest.includes("naran")) {
      if (dep.includes("islamabad") || dep.includes("rawalpindi"))
        distanceKm = 240;
      else if (dep.includes("lahore")) distanceKm = 610;
      else distanceKm = 320;
    }

    const nights = Math.max(1, totalDays - 1);
    const numTravelers = Math.max(1, travelers || 2);

    let transportCost = Math.round(((distanceKm * 2) / 12) * 280);
    if (transportCost > 18000) transportCost = Math.round(numTravelers * 4500);
    if (transportCost < 3500) transportCost = 3500;

    const roomsNeeded = Math.ceil(numTravelers / 2);
    const hotelCost = roomsNeeded * 3200 * nights;
    const foodCost = numTravelers * 850 * totalDays;
    const activityCost = Math.round(numTravelers * 750 + 1000);

    const totalFund = transportCost + hotelCost + foodCost + activityCost;
    const roundedFund = Math.round(totalFund / 500) * 500;

    return {
      distanceKm,
      transportCost,
      hotelCost,
      foodCost,
      activityCost,
      totalFund: roundedFund,
      nights,
      travelers: numTravelers,
    };
  }

  updateAIFundDisplay() {
    const depCity = (
      this.state.trip.departureCity ||
      (document.getElementById("input-departure-city")
        ? document.getElementById("input-departure-city").value.trim()
        : "")
    ).trim();
    const destCity = (
      this.state.trip.destination ||
      (this.destSearchInput ? this.destSearchInput.value.trim() : "")
    ).trim();
    const travelers =
      this.state.trip.travelers ||
      (this.inputTravelers ? Number(this.inputTravelers.value) : 2) ||
      2;
    const totalDays = this.state.trip.totalDays || 4;

    const summaryText = document.getElementById("ai-fund-summary-text");
    const breakdownRow = document.getElementById("ai-fund-breakdown-row");
    const applyBtn = document.getElementById("btn-apply-ai-fund");
    const noteEl = document.getElementById("ai-fund-validation-note");
    const distEl = document.getElementById("ai-fund-dist");
    const fuelEl = document.getElementById("ai-fund-fuel");
    const hotelEl = document.getElementById("ai-fund-hotel");
    const foodEl = document.getElementById("ai-fund-food");

    if (!summaryText) return;

    if (!depCity || !destCity) {
      summaryText.textContent =
        "Enter your departure city and destination above to automatically calculate route distance, fuel, hotel stays, and recommended fund for " +
        travelers +
        " people!";
      if (breakdownRow) breakdownRow.style.display = "none";
      if (applyBtn) applyBtn.style.display = "none";
      if (noteEl) noteEl.textContent = "";
      return;
    }

    const calc = this.calculateAIFund(depCity, destCity, travelers, totalDays);
    if (!calc) return;

    this.latestAIFund = calc.totalFund;

    if (distEl) distEl.textContent = `~${calc.distanceKm} km`;
    if (fuelEl)
      fuelEl.textContent = `Rs ${calc.transportCost.toLocaleString()}`;
    if (hotelEl) hotelEl.textContent = `Rs ${calc.hotelCost.toLocaleString()}`;
    if (foodEl) foodEl.textContent = `Rs ${calc.foodCost.toLocaleString()}`;

    summaryText.innerHTML = `🤖 <strong>AI Estimated Travel Fund:</strong> <span style="color:#67e8f9;font-weight:700;">Rs ${calc.totalFund.toLocaleString()}</span> for <strong>${calc.travelers} Travelers</strong> (${calc.nights} Nights in ${destCity}).`;
    if (breakdownRow) breakdownRow.style.display = "grid";

    if (applyBtn) {
      applyBtn.style.display = "inline-block";
      applyBtn.textContent = `✨ Apply AI Fund (Rs ${calc.totalFund.toLocaleString()})`;
    }

    const currentBudget =
      Number(this.state.trip.totalBudget) ||
      (this.inputBudget ? Number(this.inputBudget.value) : 25000);
    if (noteEl) {
      if (currentBudget >= calc.totalFund) {
        noteEl.innerHTML = `<span style="color:#6ee7b7;">✓ Your budget of Rs ${currentBudget.toLocaleString()} comfortably covers all travel & stay costs!</span>`;
      } else {
        noteEl.innerHTML = `<span style="color:#fcd34d;">💡 Suggested fund is Rs ${calc.totalFund.toLocaleString()}. Daily limit: Rs ${Math.round(currentBudget / totalDays).toLocaleString()}/day.</span>`;
      }
    }
  }

  applyAIFund() {
    if (!this.latestAIFund) return;
    this.state.trip.totalBudget = this.latestAIFund;
    if (this.inputBudget) this.inputBudget.value = this.latestAIFund;
    this.saveState();
    this.renderBudget();
    this.updateBudgetSyncElements();
    this.updateAIFundDisplay();
    this.showToast(
      `✨ AI Recommended Fund of Rs ${this.latestAIFund.toLocaleString()} applied to your trip!`,
    );
  }

  shareTripWhatsApp() {
    const trip = this.state.trip;
    const dest = trip.destination || "Pakistan Expedition";
    const dep = trip.departureCity || "Islamabad";
    const dates = trip.datesDisplay || "Upcoming Dates";
    const budget = this.formatMoney(trip.totalBudget || 25000);
    const members =
      this.state.members.map((m) => m.name).join(", ") || "Group of 2";
    const fairShare = this.formatMoney(
      Math.round(
        (trip.totalBudget || 25000) / (this.state.members.length || 2),
      ),
    );
    const hotel = trip.hotelName || "Serena Hotel / Mountain Resort";

    const text =
      `🏔️ *WanderWise Trip Plan - ${dest}*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🚩 *Starting From:* ${dep}\n` +
      `📍 *Destination:* ${dest}\n` +
      `📅 *Dates:* ${dates}\n` +
      `👥 *Squad:* ${members} (${trip.travelers} Travelers)\n` +
      `💰 *Total Budget:* ${budget}\n` +
      `💸 *Per Person Share:* ${fairShare}\n` +
      `🏨 *Stay:* ${hotel}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `✨ Planned with *WanderWise AI* - Smarter Trips, Happier Journeys!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    this.showToast("📲 WhatsApp Trip Share opened in a new tab!");
  }

  renderItinerary() {
    const tabsContainer = document.getElementById("days-tabs-container");
    if (!tabsContainer) return;

    tabsContainer.innerHTML = "";

    // Show empty state if no trip is configured
    if (!this.state.itineraryDays || this.state.itineraryDays.length === 0) {
      const listContainer = document.getElementById(
        "activities-list-container",
      );
      if (listContainer) {
        listContainer.innerHTML = `
          <div style="text-align:center;padding:48px 24px;color:var(--text-muted);">
            <div style="font-size:3rem;margin-bottom:12px;">🗺️</div>
            <h3 style="color:#fff;margin-bottom:8px;">No Trip Configured Yet</h3>
            <p style="font-size:0.88rem;margin-bottom:16px;">Go to <strong style="color:var(--primary-emerald);">Trip Setup</strong> to enter your departure city, destination, dates and budget.</p>
            <button class="btn-primary" onclick="window.app.switchView('view-home')" style="font-size:0.85rem;padding:10px 22px;">✨ Setup My Trip</button>
          </div>
        `;
      }
      return;
    }

    this.state.itineraryDays.forEach((day, idx) => {
      const btn = document.createElement("button");
      btn.className = `day-tab-btn ${idx === this.currentDayIndex ? "active" : ""}`;
      btn.innerHTML = `
        <span class="day-dot"></span>
        <span>Day ${day.dayNumber} • ${day.dateLabel}</span>
      `;
      btn.addEventListener("click", () => {
        this.currentDayIndex = idx;
        this.renderItinerary();
        this.renderFatigue();
      });
      tabsContainer.appendChild(btn);
    });

    const currentDay = this.state.itineraryDays[this.currentDayIndex];
    if (!currentDay) return;

    const heading = document.getElementById("current-day-heading");
    const subheading = document.getElementById("current-day-subheading");
    if (heading)
      heading.textContent = `Day ${currentDay.dayNumber} — ${currentDay.dateLabel}`;
    if (subheading) subheading.textContent = currentDay.title;

    const listContainer = document.getElementById("activities-list-container");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    const isRain = this.state.trip.rainMode;

    currentDay.activities.forEach((act, idx) => {
      const isSwapped = isRain && act.outdoor;
      const row = document.createElement("div");
      row.className = `activity-row ${isSwapped ? "rain-swapped" : ""} ${act.completed ? "done" : ""}`;

      let displayTitle = act.title;
      let displayBadge = act.outdoor ? "Outdoor" : "Indoor";
      let icon = "📍";

      if (act.type === "transport") icon = "🚐";
      else if (act.type === "food") icon = "🍲";
      else if (act.type === "rest") icon = "☕";
      else if (act.type === "adventure") icon = "🏔️";
      else if (act.type === "culture") icon = "🏛️";
      else if (act.type === "leisure") icon = "🎭";

      if (
        isSwapped &&
        currentDay.rainAlternatives &&
        currentDay.rainAlternatives[idx % currentDay.rainAlternatives.length]
      ) {
        const alt =
          currentDay.rainAlternatives[idx % currentDay.rainAlternatives.length];
        displayTitle = `☔ [Rain Backup] ${alt.title}`;
        displayBadge = alt.type;
        icon = alt.icon;
      }

      row.innerHTML = `
        <div class="activity-time">${act.time}</div>
        <div class="activity-icon-wrap">${icon}</div>
        <div class="activity-details">
          <div class="activity-title">
            <span>${displayTitle}</span>
          </div>
          <div class="activity-badges">
            <span class="tag-intensity ${act.intensity}">${act.intensity} Energy</span>
            <span class="tag-outdoor">${displayBadge}</span>
            <span style="font-size: 0.68rem; color: var(--text-dim);">⏱️ ${act.duration}</span>
          </div>
        </div>
        <div class="activity-actions">
          <span class="check-pill ${act.completed ? "completed" : ""}" title="Toggle Completion">
            ${act.completed ? "✅" : "⚪"}
          </span>
        </div>
      `;

      const checkBtn = row.querySelector(".check-pill");
      checkBtn.addEventListener("click", () => {
        act.completed = !act.completed;
        this.saveState();
        this.renderItinerary();
        this.renderFatigue();
      });

      listContainer.appendChild(row);
    });

    const altContainer = document.getElementById("rain-alternatives-container");
    if (altContainer && currentDay.rainAlternatives) {
      altContainer.innerHTML = "";
      const altHeader = document.getElementById("rain-alt-count");
      if (altHeader)
        altHeader.textContent = `${currentDay.rainAlternatives.length} Available`;

      currentDay.rainAlternatives.forEach((alt) => {
        const altRow = document.createElement("div");
        altRow.className = "rain-alt-item";
        altRow.innerHTML = `
          <span class="icon">${alt.icon}</span>
          <div class="rain-alt-info">
            <div class="name">${alt.title}</div>
            <div class="type">${alt.type} • ${alt.duration}</div>
          </div>
          <button class="btn-copy-acc" style="font-size: 0.7rem; padding: 3px 8px;">Swap</button>
        `;
        altRow.querySelector("button").addEventListener("click", () => {
          this.toggleRainMode(true);
        });
        altContainer.appendChild(altRow);
      });
    }

    const journalInput = document.getElementById("daily-journal-notes");
    if (journalInput) {
      journalInput.value = currentDay.journalNotes || "";
    }

    this.renderTerrainSection(currentDay);
  }

  renderTerrainSection(currentDay) {
    const terrainTitle = document.getElementById("terrain-section-title");
    const altBadge = document.getElementById("altitude-badge");
    const oxygenVal = document.getElementById("oxygen-stat-val");
    const distanceVal = document.getElementById("distance-stat-val");
    const uvVal = document.getElementById("uv-stat-val");

    const destLower = (this.state.trip.destination || "").toLowerCase();
    let altLow = "2,500 ft",
      altHigh = "7,800 ft",
      oxygen = "94% Optimal",
      distance = "3.8 km",
      uv = "Moderate (SPF 50)";

    if (destLower.includes("skardu") || destLower.includes("deosai")) {
      altLow = "7,500 ft";
      altHigh = "14,000 ft";
      oxygen = "72% Low-Altitude Caution";
      distance = "6.5 km";
      uv = "Very High (SPF 70)";
    } else if (destLower.includes("hunza")) {
      altLow = "5,800 ft";
      altHigh = "11,200 ft";
      oxygen = "82% Moderate";
      distance = "5.2 km";
      uv = "High (SPF 60)";
    } else if (destLower.includes("swat")) {
      altLow = "3,250 ft";
      altHigh = "9,400 ft";
      oxygen = "91% Good";
      distance = "4.8 km";
      uv = "Moderate (SPF 50)";
    } else if (destLower.includes("murree")) {
      altLow = "4,500 ft";
      altHigh = "7,500 ft";
      oxygen = "93% Good";
      distance = "3.2 km";
      uv = "Low-Moderate (SPF 40)";
    }

    if (terrainTitle)
      terrainTitle.textContent = `Route Elevation — Day ${currentDay.dayNumber}: ${currentDay.title}`;
    if (altBadge) altBadge.textContent = `${altLow} → ${altHigh}`;
    if (oxygenVal) oxygenVal.textContent = oxygen;
    if (distanceVal) distanceVal.textContent = distance;
    if (uvVal) uvVal.textContent = uv;
  }

  renderFatigue() {
    const currentDay = this.state.itineraryDays[this.currentDayIndex];
    if (!currentDay) return;

    let energy = 100;
    currentDay.activities.forEach((act) => {
      if (act.completed) {
        energy -= act.fatigueCost || 10;
      }
    });

    if (this.state.trip.vibe === "High Adventure") energy -= 10;
    if (this.state.trip.vibe === "Chill") energy += 5;
    if (this.state.trip.rainMode) energy += 8;

    energy = Math.max(20, Math.min(98, Math.round(energy)));

    const valEl = document.getElementById("fatigue-percentage-val");
    const barEl = document.getElementById("fatigue-bar-fill");
    const circleEl = document.getElementById("fatigue-gauge-circle");
    const statusTitle = document.getElementById("fatigue-status-title");
    const statusDesc = document.getElementById("fatigue-status-desc");
    const sideBadge = document.getElementById("sidebar-fatigue-badge");
    const loadLabel = document.getElementById("fatigue-load-label");

    if (valEl) valEl.textContent = `${energy}%`;
    if (barEl) barEl.style.width = `${energy}%`;
    if (sideBadge) sideBadge.textContent = `${energy}% 🔋`;

    let color = "var(--primary-emerald)";
    let title = "Good Pace!";
    let desc =
      "You're doing great! Keep recommended rest breaks between intensive activities.";
    let load = "Low-Medium";

    if (energy < 40) {
      color = "var(--accent-rose)";
      title = "⚠️ Critical Fatigue!";
      desc =
        "Energy critically low! Plan a rest stop immediately. Visit a chai dhaba or relax at the hotel.";
      load = "Extreme";
    } else if (energy < 60) {
      color = "var(--accent-rose)";
      title = "Fatigue Warning!";
      desc =
        "Energy running low! Plan a cafe break or warm herbal kehwa to prevent burnout.";
      load = "Heavy";
    } else if (energy < 75) {
      color = "var(--accent-amber)";
      title = "Moderate Strain";
      desc =
        "Active pace detected. Ensure sufficient hydration and 30-min buffer times between activities.";
      load = "Moderate";
    } else if (energy >= 90) {
      title = "Peak Energy! 🚀";
      desc =
        "You are fully energized — perfect for intense treks or adventure activities today!";
      load = "Light";
    }

    if (statusTitle) {
      statusTitle.textContent = title;
      statusTitle.style.color = color;
    }
    if (statusDesc) statusDesc.textContent = desc;
    if (loadLabel) loadLabel.textContent = load;

    if (circleEl) {
      circleEl.style.background = `conic-gradient(${color} 0deg ${energy * 3.6}deg, rgba(255, 255, 255, 0.08) ${energy * 3.6}deg 360deg)`;
      circleEl.style.boxShadow = `0 0 25px ${color}40`;
    }
  }

  renderBudget() {
    const { netBalances, totalSpent, perPersonShare } =
      DebtMinimizer.calculateNetBalances(
        this.state.members,
        this.state.expenses,
      );

    const totalBudget = this.state.trip.totalBudget;
    const remaining = totalBudget - totalSpent;
    const spentPercent = Math.min(
      100,
      Math.round((totalSpent / totalBudget) * 100),
    );

    const elTotBudget = document.getElementById("stat-total-budget");
    const elTotSpent = document.getElementById("stat-total-spent");
    const elSpentPercent = document.getElementById("stat-spent-percent");
    const elRemaining = document.getElementById("stat-remaining");
    const elFairShare = document.getElementById("stat-fair-share");
    const elMemberHeading = document.getElementById("group-members-heading");
    const elMembersCount = document.getElementById("stat-members-count-label");
    const elSpentBar = document.getElementById("spent-progress-bar");

    if (elTotBudget) elTotBudget.textContent = this.formatMoney(totalBudget);
    if (elTotSpent) elTotSpent.textContent = this.formatMoney(totalSpent);
    if (elSpentPercent)
      elSpentPercent.textContent = `${spentPercent}% of budget consumed`;
    if (elRemaining) {
      elRemaining.textContent = this.formatMoney(remaining);
      elRemaining.style.color =
        remaining < 0 ? "var(--accent-rose)" : "#6ee7b7";
    }
    if (elFairShare) elFairShare.textContent = this.formatMoney(perPersonShare);
    if (elMemberHeading)
      elMemberHeading.textContent = `Group Members (${this.state.members.length} Active)`;
    if (elMembersCount)
      elMembersCount.textContent = `Based on ${this.state.members.length} squad members`;
    if (elSpentBar) elSpentBar.style.width = `${spentPercent}%`;

    const membersContainer = document.getElementById("members-list-container");
    if (membersContainer) {
      membersContainer.innerHTML = "";

      if (this.state.members.length === 0) {
        membersContainer.innerHTML = `
          <div style="text-align:center;padding:28px 16px;color:var(--text-muted);font-size:0.88rem;">
            <div style="font-size:2.2rem;margin-bottom:8px;">👥</div>
            <div style="margin-bottom:6px;">No squad members yet!</div>
            <div style="font-size:0.8rem;">Click <strong style="color:var(--primary-emerald);">+ Add Member</strong> above to add trip participants and start tracking expenses.</div>
          </div>
        `;
      } else {
        this.state.members.forEach((m) => {
          const net = Math.round(netBalances[m.id] || 0);
          let badgeClass = "settled";
          let badgeText = "✓ Settled";

          if (net > 5) {
            badgeClass = "gets-back";
            badgeText = `Gets Back: ${this.formatMoney(net)}`;
          } else if (net < -5) {
            badgeClass = "owes";
            badgeText = `Owes: ${this.formatMoney(Math.abs(net))}`;
          }

          const row = document.createElement("div");
          row.className = "member-row";
          row.innerHTML = `
            <div class="member-identity">
              <div class="member-avatar-circle" style="background: ${m.color}25; border: 1px solid ${m.color};">${m.avatar}</div>
              <div class="member-name-block">
                <div class="name">${m.name}</div>
                <div class="paid-label">Total Outlay: ${this.formatMoney(this.getMemberTotalPaid(m.id))}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <div class="balance-pill ${badgeClass}">${badgeText}</div>
              <button class="btn-copy-acc" style="padding:3px 8px;font-size:0.7rem;color:#fcd34d;border-color:rgba(252,211,77,0.3);" title="Edit Member" data-edit-id="${m.id}">✏️ Edit</button>
              <button class="btn-copy-acc" style="padding:3px 8px;font-size:0.7rem;color:#fca5a5;border-color:rgba(252,165,165,0.3);" title="Delete Member" data-del-id="${m.id}">🗑️ Del</button>
            </div>
          `;

          row
            .querySelector(`[data-edit-id="${m.id}"]`)
            .addEventListener("click", () => this.editMember(m.id));
          row
            .querySelector(`[data-del-id="${m.id}"]`)
            .addEventListener("click", () => this.deleteMember(m.id));

          membersContainer.appendChild(row);
        });
      }
    }

    const settlements = DebtMinimizer.minimizeDebts(
      this.state.members,
      this.state.expenses,
    );
    const settlementsContainer = document.getElementById(
      "settlements-container",
    );
    const countDisplay = document.getElementById("settlement-count-display");

    if (countDisplay) countDisplay.textContent = settlements.length;

    if (settlementsContainer) {
      settlementsContainer.innerHTML = "";

      if (settlements.length === 0) {
        settlementsContainer.innerHTML = `
          <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.9rem;">
            🎉 All debts are completely balanced and settled!
          </div>
        `;
      } else {
        settlements.forEach((st) => {
          const card = document.createElement("div");
          card.className = "transfer-card";
          card.innerHTML = `
            <div class="transfer-parties">
              <div class="payer-node">${st.from ? st.from.name : "Member"}</div>
              <div class="transfer-arrow-node">
                <span>➔ pays ➔</span>
              </div>
              <div class="receiver-node">${st.to ? st.to.name : "Member"}</div>
            </div>
            <div class="transfer-amount-tag">
              ${this.formatMoney(st.amount)}
            </div>
          `;
          settlementsContainer.appendChild(card);
        });
      }
    }

    const tableBody = document.getElementById("expenses-table-body");
    if (tableBody) {
      tableBody.innerHTML = "";
      const memberMap = new Map(this.state.members.map((m) => [m.id, m]));

      this.state.expenses
        .slice()
        .reverse()
        .forEach((exp) => {
          const payer = memberMap.get(exp.payerId);
          const catIcons = {
            Stay: "🏨",
            Food: "🍲",
            Transport: "🚐",
            Activities: "🎿",
            Emergency: "🚨",
            Deposit: "💵",
            General: "📋",
          };
          const tr = document.createElement("tr");
          tr.innerHTML = `
          <td><strong>${exp.title}</strong></td>
          <td><span class="badge" style="background: rgba(255,255,255,0.06);">${catIcons[exp.category] || "📋"} ${exp.category}</span></td>
          <td>${payer ? payer.name : "Unknown"}</td>
          <td style="color: var(--text-muted);">${exp.date}</td>
          <td style="text-align: right; font-weight: 700; color: #ffffff;">${this.formatMoney(exp.amount)}</td>
        `;
          tableBody.appendChild(tr);
        });
    }
  }

  getMemberTotalPaid(memberId) {
    return this.state.expenses
      .filter((e) => e.payerId === memberId)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }

  openAddMemberModal() {
    const nameInput = document.getElementById("new-member-name");
    const spendInput = document.getElementById("new-member-initial-spend");
    if (nameInput) nameInput.value = "";
    if (spendInput) spendInput.value = "0";
    this.memberModal.classList.add("active");
  }

  saveNewMember() {
    const nameInput = document.getElementById("new-member-name");
    const spendInput = document.getElementById("new-member-initial-spend");

    const name = nameInput ? nameInput.value.trim() : "";
    const initialSpend = spendInput ? Number(spendInput.value) || 0 : 0;

    if (!name) {
      this.showToast("⚠️ Please enter the squad member name!");
      return;
    }

    const colors = [
      "#ec4899",
      "#06b6d4",
      "#14b8a6",
      "#f59e0b",
      "#8b5cf6",
      "#10b981",
    ];
    const newId = `m_${Date.now()}`;

    const newMember = {
      id: newId,
      name: name,
      avatar: this.selectedMemberAvatar || "🧗",
      color: colors[Math.floor(Math.random() * colors.length)],
      initialSpent: initialSpend,
    };

    this.state.members.push(newMember);

    if (initialSpend > 0) {
      this.state.expenses.push({
        id: `exp_${Date.now()}`,
        title: `${name}'s Group Deposit`,
        amount: initialSpend,
        payerId: newId,
        category: "Deposit",
        date: new Date().toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      });
    }

    this.saveState();
    this.memberModal.classList.remove("active");
    this.renderBudget();
    this.showToast(`👥 Squad member "${name}" added to the group!`);
  }

  editMember(memberId) {
    const member = this.state.members.find((m) => m.id === memberId);
    if (!member) return;
    const newName = prompt(`Edit name for "${member.name}":`, member.name);
    if (newName && newName.trim()) {
      member.name = newName.trim();
      this.saveState();
      this.renderBudget();
      this.showToast(`✏️ Member renamed to "${member.name}"!`);
    }
  }

  deleteMember(memberId) {
    const member = this.state.members.find((m) => m.id === memberId);
    if (!member) return;
    if (
      !confirm(
        `Remove "${member.name}" from the trip group? Their expenses will also be removed.`,
      )
    )
      return;
    this.state.members = this.state.members.filter((m) => m.id !== memberId);
    this.state.expenses = this.state.expenses.filter(
      (e) => e.payerId !== memberId,
    );
    this.saveState();
    this.renderBudget();
    this.showToast(`🗑️ "${member.name}" removed from the group.`);
  }

  openExpenseModal() {
    const select = document.getElementById("new-expense-payer");
    if (select) {
      select.innerHTML = "";
      this.state.members.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        select.appendChild(opt);
      });
    }
    this.expenseModal.classList.add("active");
  }

  saveNewExpense() {
    const titleInput = document.getElementById("new-expense-title");
    const amountInput = document.getElementById("new-expense-amount");
    const catInput = document.getElementById("new-expense-category");
    const payerInput = document.getElementById("new-expense-payer");

    const title = titleInput ? titleInput.value.trim() : "";
    const amount = amountInput ? Number(amountInput.value) : 0;

    if (!title || amount <= 0) {
      this.showToast("⚠️ Please enter a valid expense title and amount!");
      return;
    }

    this.state.expenses.push({
      id: `exp_${Date.now()}`,
      title,
      amount,
      payerId: payerInput ? payerInput.value : this.state.members[0].id,
      category: catInput ? catInput.value : "General",
      date: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    });

    this.saveState();
    this.expenseModal.classList.remove("active");
    if (titleInput) titleInput.value = "";
    if (amountInput) amountInput.value = "";

    this.renderBudget();
    this.showToast(`💸 Expense "${title}" added! Group debts recalculated.`);
  }

  switchVaultTab(tab) {
    this.activeVaultTab = tab;
    const tabChecklist = document.getElementById("tab-vault-checklist");
    const tabEmergency = document.getElementById("tab-vault-emergency");
    const paneChecklist = document.getElementById("vault-checklist-pane");
    const paneEmergency = document.getElementById("vault-emergency-pane");

    if (tab === "checklist") {
      if (tabChecklist) tabChecklist.classList.add("active");
      if (tabEmergency) tabEmergency.classList.remove("active");
      if (paneChecklist) paneChecklist.style.display = "block";
      if (paneEmergency) paneEmergency.style.display = "none";
    } else {
      if (tabEmergency) tabEmergency.classList.add("active");
      if (tabChecklist) tabChecklist.classList.remove("active");
      if (paneChecklist) paneChecklist.style.display = "none";
      if (paneEmergency) paneEmergency.style.display = "block";
    }
  }

  renderVault() {
    const container = document.getElementById("checklist-categories-container");
    if (!container) return;

    container.innerHTML = "";
    let totalItems = 0;
    let checkedItems = 0;

    this.state.vaultCategories.forEach((cat) => {
      const catTotal = cat.items.length;
      const catChecked = cat.items.filter((i) => i.checked).length;
      totalItems += catTotal;
      checkedItems += catChecked;

      const card = document.createElement("div");
      card.className = "checklist-cat-card";
      card.innerHTML = `
        <div class="cat-header">
          <div class="cat-title">
            <span>${cat.icon}</span>
            <span>${cat.title}</span>
          </div>
          <div class="cat-count">${catChecked}/${catTotal} Packed</div>
        </div>
        <div class="checklist-items-stack" id="cat-stack-${cat.id}"></div>
      `;

      const stack = card.querySelector(`#cat-stack-${cat.id}`);
      cat.items.forEach((item) => {
        const label = document.createElement("label");
        label.className = "chk-item-label";
        label.innerHTML = `
          <input type="checkbox" class="chk-checkbox" ${item.checked ? "checked" : ""}>
          <span class="chk-item-text">${item.text}</span>
        `;

        label.querySelector("input").addEventListener("change", (e) => {
          item.checked = e.target.checked;
          this.saveState();
          this.renderVault();
        });

        stack.appendChild(label);
      });

      container.appendChild(card);
    });

    const progText = document.getElementById("checklist-progress-text");
    const progBar = document.getElementById("checklist-progress-bar");
    const percent =
      totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

    if (progText)
      progText.textContent = `${checkedItems} of ${totalItems} Packed (${percent}%)`;
    if (progBar) progBar.style.width = `${percent}%`;
  }

  toggleAllChecklistItems(shouldCheck) {
    this.state.vaultCategories.forEach((c) => {
      c.items.forEach((i) => (i.checked = shouldCheck));
    });
    this.saveState();
    this.renderVault();
    this.showToast(
      shouldCheck
        ? "🎒 All items marked as packed!"
        : "↺ Checklist reset to unpacked.",
    );
  }

  renderEmergencyOneSheet() {
    const data = this.state.emergencyOneSheet;
    if (!data) return;

    const elHotelEn = document.getElementById("emergency-hotel-en");
    const elHotelUr = document.getElementById("emergency-hotel-ur");
    const elBookingRef = document.getElementById("emergency-booking-ref");

    if (elHotelEn)
      elHotelEn.textContent =
        (this.state.trip.hotelName || data.hotelName) +
        " — " +
        (this.state.trip.destination || "");
    if (elHotelUr)
      elHotelUr.textContent =
        this.state.trip.hotelLocalScript || data.hotelLocalScript;
    if (elBookingRef)
      elBookingRef.textContent = this.state.trip.bookingRef || data.bookingRef;

    const helplinesContainer = document.getElementById(
      "emergency-helplines-list",
    );
    if (helplinesContainer) {
      helplinesContainer.innerHTML = "";
      data.emergencyNumbers.forEach((n) => {
        const item = document.createElement("div");
        item.className = "emergency-contact-item";
        item.innerHTML = `
          <div>
            <div class="contact-name">${n.name}</div>
            <div class="contact-desc">${n.desc}</div>
          </div>
          <div class="contact-number-badge">📞 ${n.number}</div>
        `;
        helplinesContainer.appendChild(item);
      });
    }

    const tripContactsContainer = document.getElementById(
      "emergency-trip-contacts-list",
    );
    if (tripContactsContainer) {
      tripContactsContainer.innerHTML = "";
      data.tripContacts.forEach((c) => {
        const item = document.createElement("div");
        item.className = "emergency-contact-item";
        item.innerHTML = `
          <div>
            <div class="contact-name">${c.name} (${c.role})</div>
            <div class="contact-desc">${c.phone}</div>
          </div>
          <button class="btn-copy-acc" style="font-size: 0.7rem; padding: 3px 8px;" onclick="window.app.copyToClipboard('${c.phone}', 'Number copied!')">📋 Copy</button>
        `;
        tripContactsContainer.appendChild(item);
      });
    }

    const notesContainer = document.getElementById("emergency-notes-list");
    if (notesContainer) {
      notesContainer.innerHTML = "";
      data.quickNotes.forEach((note) => {
        const li = document.createElement("li");
        li.textContent = note;
        notesContainer.appendChild(li);
      });
    }

    const destEl = document.getElementById("emergency-destination-display");
    if (destEl) destEl.textContent = this.state.trip.destination;

    const datesEl = document.getElementById("emergency-dates-display");
    if (datesEl) datesEl.textContent = this.state.trip.datesDisplay;
  }

  renderProPricing() {
    const priceDisplay = document.getElementById("pro-price-display");
    const currDisplay = document.getElementById("pro-price-curr");
    const modalAmount = document.getElementById("modal-payable-amount");

    if (this.state.trip.currency === "USD") {
      const usd = Math.round(100 / this.exchangeRate);
      if (priceDisplay) priceDisplay.textContent = usd < 1 ? "1" : usd;
      if (currDisplay) currDisplay.textContent = "$";
      if (modalAmount)
        modalAmount.textContent = `$${usd < 1 ? 1 : usd} USD (or Rs 100 PKR)`;
    } else {
      if (priceDisplay) priceDisplay.textContent = "100";
      if (currDisplay) currDisplay.textContent = "Rs";
      if (modalAmount) modalAmount.textContent = "Rs 100 PKR";
    }

    const isPro = this.state.trip.isPro || false;
    const hasPending = !!localStorage.getItem(
      "wanderwise_payment_submission_id",
    );

    const proStatusEl = document.getElementById("pro-current-status");
    if (proStatusEl) {
      if (isPro) {
        proStatusEl.textContent = "✅ PRO ACTIVE — All Features Unlocked!";
        proStatusEl.style.color = "#6ee7b7";
        proStatusEl.style.fontWeight = "800";
        proStatusEl.style.fontSize = "1rem";
      } else if (hasPending) {
        proStatusEl.textContent = "⏳ Payment Under Review — Please Wait";
        proStatusEl.style.color = "#fcd34d";
      } else {
        proStatusEl.textContent = "UPGRADE AVAILABLE";
        proStatusEl.style.color = "#a5b4fc";
      }
    }

    const openPaymentBtns = [
      document.getElementById("btn-open-payment-modal"),
      document.getElementById("header-upgrade-btn"),
      document.getElementById("quick-pro-btn"),
    ];

    openPaymentBtns.forEach((btn) => {
      if (!btn) return;
      if (isPro) {
        btn.disabled = true;
        btn.style.opacity = "0.4";
        btn.style.cursor = "not-allowed";
        btn.title = "PRO already active!";
        if (btn.id === "header-upgrade-btn") {
          btn.innerHTML = "<span>👑 PRO Active</span>";
        }
      } else if (hasPending) {
        btn.disabled = true;
        btn.style.opacity = "0.6";
        btn.style.cursor = "not-allowed";
        btn.title = "Payment submitted — awaiting admin verification";
        if (btn.id === "header-upgrade-btn") {
          btn.innerHTML = "<span>⏳ Under Review</span>";
        }
      } else {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.title = "";
        if (btn.id === "header-upgrade-btn") {
          btn.innerHTML = "<span>👑 Upgrade PRO</span>";
        }
      }
    });

    if (this.pendingPaymentBanner) {
      this.pendingPaymentBanner.style.display =
        hasPending && !isPro ? "flex" : "none";
    }

    const proActiveSection = document.getElementById("pro-active-section");
    if (proActiveSection) {
      proActiveSection.style.display = isPro ? "block" : "none";
    }

    const proUpgradeSection = document.getElementById("pro-upgrade-section");
    if (proUpgradeSection) {
      proUpgradeSection.style.display = isPro ? "none" : "block";
    }
  }

  renderWeatherSchedule() {
    const container = document.getElementById("forecast-days-container");
    if (!container) return;

    container.innerHTML = "";

    if (!this.state.itineraryDays || this.state.itineraryDays.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);font-size:0.88rem;">🌦️ Configure your trip first to see weather forecast.</div>`;
      return;
    }

    const baseTemp =
      this.state.trip.weather && this.state.trip.weather.tempC
        ? this.state.trip.weather.tempC
        : 22;
    const weatherConditions = [
      {
        cond: "Light Mountain Rain",
        icon: "🌧️",
        rain: "65%",
        high: baseTemp + 2,
        low: baseTemp - 3,
      },
      {
        cond: "Partly Sunny & Crisp",
        icon: "⛅",
        rain: "20%",
        high: baseTemp + 4,
        low: baseTemp - 2,
      },
      {
        cond: "Scattered Showers",
        icon: "🌦️",
        rain: "50%",
        high: baseTemp,
        low: baseTemp - 5,
      },
      {
        cond: "Alpine Clear Skies",
        icon: "☀️",
        rain: "10%",
        high: baseTemp + 6,
        low: baseTemp - 1,
      },
      {
        cond: "Misty Afternoon Breeze",
        icon: "🌤️",
        rain: "25%",
        high: baseTemp + 3,
        low: baseTemp - 4,
      },
      {
        cond: "Overcast & Cool",
        icon: "🌥️",
        rain: "45%",
        high: baseTemp + 1,
        low: baseTemp - 6,
      },
      {
        cond: "Clear Mountain Sunrise",
        icon: "🌅",
        rain: "5%",
        high: baseTemp + 5,
        low: baseTemp - 2,
      },
    ];

    this.state.itineraryDays.forEach((day, idx) => {
      const condObj = weatherConditions[idx % weatherConditions.length];
      const row = document.createElement("div");
      row.className = "forecast-day-row";
      const rainNum = parseInt(condObj.rain);
      const rainColor =
        rainNum > 40 ? "#67e8f9" : rainNum > 20 ? "#fcd34d" : "#6ee7b7";

      row.innerHTML = `
        <div>
          <strong style="color: #ffffff;">${day.dateLabel}</strong>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${day.title}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.5rem;">${condObj.icon}</span>
          <div>
            <div style="font-size: 0.85rem; color: #ffffff; font-weight: 600;">${condObj.cond}</div>
            <div style="font-size: 0.72rem; color: ${rainColor};">🌧️ ${condObj.rain} Rain Chance</div>
          </div>
        </div>
        <div style="text-align: right;">
          <strong style="color: #ffffff;">${condObj.high}°C</strong>
          <div style="font-size: 0.72rem; color: var(--text-dim);">Low: ${condObj.low}°C</div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  openMeezanModal() {
    this.resetPaymentModal();
    if (this.meezanModal) this.meezanModal.classList.add("active");
  }

  /**
   * REAL payment submission — sends proof + sender info to the FastAPI backend,
   * which stores it as "pending" until Kamran manually checks his bank account
   * and approves it from the admin panel. No automatic/fake activation here.
   */
  async handleRealisticPaymentVerification() {
    const trxInput = document.getElementById("input-trx-id");
    const rawVal = trxInput ? trxInput.value.trim() : "";

    if (!this.attachedProofFile) {
      this.showToast(
        "⚠️ Pehle payment ka screenshot ya receipt attach karein!",
      );
      return;
    }

    if (!rawVal) {
      this.showToast("⚠️ Transaction ID ya Sender Mobile Number darj karein!");
      return;
    }

    const cleanVal = rawVal.replace(/[\s\-]/g, "");
    const isPakMobile = /^03[0-9]{9}$/.test(cleanVal);
    const isTrxRef = cleanVal.length >= 8 && /[a-zA-Z0-9]{8,}/.test(cleanVal);

    if (!isPakMobile && !isTrxRef) {
      this.showToast(
        "⚠️ Valid sender mobile number (03XX-XXXXXXX) ya Bank TRX Reference ID darj karein!",
      );
      return;
    }

    const loaderBox = document.getElementById("verification-progress-box");
    const confirmBtn = document.getElementById("btn-confirm-payment");

    if (loaderBox) loaderBox.style.display = "block";
    if (confirmBtn) confirmBtn.disabled = true;

    try {
      const formData = new FormData();
      formData.append("sender_info", rawVal);
      formData.append("proof", this.attachedProofFile);

      const res = await fetch(`${this.apiBase}/api/submit-payment`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      localStorage.setItem(
        "wanderwise_payment_submission_id",
        data.submission_id,
      );
      this.state.trip.pendingSubmissionId = data.submission_id;
      this.saveState();

      if (this.meezanModal) this.meezanModal.classList.remove("active");
      this.resetPaymentModal();

      const receiptTrxVal = document.getElementById("receipt-modal-trx-val");
      const receiptDateVal = document.getElementById("receipt-modal-date");
      if (receiptTrxVal) receiptTrxVal.textContent = rawVal;
      if (receiptDateVal)
        receiptDateVal.textContent = new Date().toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

      if (this.receiptModal) this.receiptModal.classList.add("active");

      this.showToast(
        "📨 Payment proof submitted! Admin ko notify kar diya gaya hai. PRO 24 hours mein activate hoga.",
      );

      // Show admin WhatsApp notification option
      if (data.admin_whatsapp) {
        setTimeout(() => {
          const notifDiv = document.createElement("div");
          notifDiv.style.cssText =
            "position:fixed;bottom:100px;right:20px;z-index:9999;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:14px 18px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.4);font-size:0.85rem;max-width:300px;cursor:pointer;";
          notifDiv.innerHTML = `
            <div style="font-weight:700;margin-bottom:4px;">🔔 Admin Notification Ready!</div>
            <div style="font-size:0.78rem;opacity:0.9;">Click to notify admin via WhatsApp to verify your payment quickly.</div>
            <div style="margin-top:8px;font-size:0.75rem;opacity:0.75;">Will auto-close in 15s</div>
          `;
          notifDiv.addEventListener("click", () => {
            window.open(data.admin_whatsapp, "_blank");
            document.body.removeChild(notifDiv);
          });
          document.body.appendChild(notifDiv);
          setTimeout(() => {
            if (notifDiv.parentNode) document.body.removeChild(notifDiv);
          }, 15000);
        }, 1500);
      }
    } catch (err) {
      this.showToast(
        "⚠️ Could not reach server. Please make sure the backend is running and try again.",
      );
    } finally {
      if (loaderBox) loaderBox.style.display = "none";
      if (confirmBtn) confirmBtn.disabled = false;
    }
  }

  async checkPendingPaymentStatus() {
    const activeSubId = localStorage.getItem(
      "wanderwise_active_pro_submission_id",
    );
    if (this.state.trip?.isPro && activeSubId) {
      try {
        const res = await fetch(
          `${this.apiBase}/api/payment-status/${activeSubId}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === "revoked" || data.status === "rejected") {
            this.resetProPlanToFree("admin_revoked");
            return;
          }
        }
      } catch (e) {}
    }

    const submissionId = localStorage.getItem(
      "wanderwise_payment_submission_id",
    );
    if (!submissionId) return;

    if (this.pendingPaymentBanner && !this.state.trip.isPro) {
      this.pendingPaymentBanner.style.display = "flex";
    }

    try {
      const res = await fetch(
        `${this.apiBase}/api/payment-status/${submissionId}`,
      );
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === "approved" && !this.state.trip.isPro) {
        this.activateProPlan(submissionId);
        localStorage.removeItem("wanderwise_payment_submission_id");
        if (this.pendingPaymentBanner)
          this.pendingPaymentBanner.style.display = "none";
      } else if (data.status === "rejected") {
        this.showToast(
          "❌ Payment verify nahi hua. Dobara try karein ya support se rabta karein.",
        );
        localStorage.removeItem("wanderwise_payment_submission_id");
        if (this.pendingPaymentBanner)
          this.pendingPaymentBanner.style.display = "none";
        this.renderProPricing();
      } else if (data.status === "revoked") {
        this.resetProPlanToFree("admin_revoked");
      } else if (data.status === "pending") {
        const subEl = document.getElementById("pending-banner-sub");
        if (subEl && data.submitted_at) {
          const submitted = new Date(data.submitted_at);
          const timeAgo = this.getTimeAgo(submitted);
          subEl.textContent = `Submitted ${timeAgo} — Admin verify kar raha hai. 24 hours mein activate hoga!`;
        }
      }
    } catch (err) {
      if (this.pendingPaymentBanner && !this.state.trip.isPro) {
        this.pendingPaymentBanner.style.display = "none";
      }
    }
  }

  async manualCheckPaymentStatus() {
    const submissionId =
      localStorage.getItem("wanderwise_payment_submission_id") ||
      localStorage.getItem("wanderwise_active_pro_submission_id");
    if (!submissionId) {
      this.showToast("⚠️ Koi pending submission nahi mila.");
      return;
    }
    const btn = document.getElementById("btn-check-payment-status");
    if (btn) {
      btn.textContent = "⏳ Checking...";
      btn.disabled = true;
    }
    try {
      const res = await fetch(
        `${this.apiBase}/api/payment-status/${submissionId}`,
      );
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      if (data.status === "approved") {
        this.activateProPlan(submissionId);
        localStorage.removeItem("wanderwise_payment_submission_id");
        if (this.pendingPaymentBanner)
          this.pendingPaymentBanner.style.display = "none";
      } else if (data.status === "pending") {
        this.showToast(
          "⏳ Ab bhi pending hai — admin review kar raha hai. Thoda sabr karein!",
        );
      } else if (data.status === "revoked") {
        this.resetProPlanToFree("admin_revoked");
      } else {
        this.showToast("❌ Payment reject ho gayi. Dobara try karein.");
        localStorage.removeItem("wanderwise_payment_submission_id");
        if (this.pendingPaymentBanner)
          this.pendingPaymentBanner.style.display = "none";
        this.renderProPricing();
      }
    } catch (err) {
      this.showToast(
        "⚠️ Backend se connect nahi ho saka. Backend server chalu karo!",
      );
    } finally {
      if (btn) {
        btn.textContent = "🔄 Check Status";
        btn.disabled = false;
      }
    }
  }

  activateProPlan(submissionId) {
    this.state.trip.isPro = true;
    if (submissionId) {
      localStorage.setItem("wanderwise_active_pro_submission_id", submissionId);
    }
    this.saveState();
    this.renderTopAndSidebar();
    this.renderProPricing();
    this.triggerCelebration();
    if (this.proActivationOverlay) {
      this.proActivationOverlay.classList.add("active");
    }
    this.showToast(
      "👑 MUBARAK HO! WanderWise PRO ab active hai! Sare features unlock ho gaye!",
    );
  }

  resetProPlanToFree(reason = "user") {
    this.state.trip.isPro = false;
    localStorage.removeItem("wanderwise_payment_submission_id");
    localStorage.removeItem("wanderwise_active_pro_submission_id");
    this.saveState();
    this.renderTopAndSidebar();
    this.renderProPricing();
    if (reason === "admin_revoked") {
      this.showToast(
        "🚫 Admin ne aapka PRO plan revoke/remove kar diya hai. Reverted to Free Explorer.",
      );
    } else {
      this.showToast(
        "↺ PRO status reset! Aap ab Free Explorer plan par hain. Upgrade flow dobara test karein.",
      );
    }
  }

  getTimeAgo(date) {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "abhi abhi";
    if (mins < 60) return `${mins} minute pehle`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ghante pehle`;
    return `${Math.floor(hrs / 24)} din pehle`;
  }

  saveNewActivity() {
    const titleInput = document.getElementById("new-activity-title");
    const timeSlotSelect = document.getElementById("new-activity-time-slot");
    const intensityInput = document.getElementById("new-activity-intensity");
    const outdoorInput = document.getElementById("new-activity-outdoor");

    const title = titleInput ? titleInput.value.trim() : "";
    if (!title) {
      this.showToast("⚠️ Please specify an activity title!");
      if (titleInput) titleInput.focus();
      return;
    }

    if (!this.state.itineraryDays || this.state.itineraryDays.length === 0) {
      const result = generateDynamicItinerary(
        this.state.trip.destination || "Swat Valley, Pakistan",
        this.state.trip.startDate || "2026-10-15",
        this.state.trip.endDate || "2026-10-20",
      );
      this.state.itineraryDays = result.days;
      this.currentDayIndex = 0;
    }

    if (this.currentDayIndex >= this.state.itineraryDays.length) {
      this.currentDayIndex = 0;
    }

    const currentDay = this.state.itineraryDays[this.currentDayIndex];
    if (currentDay) {
      const intensity = intensityInput ? intensityInput.value : "Medium";
      const fatigueCost =
        intensity === "High" ? 25 : intensity === "Low" ? 5 : 15;

      currentDay.activities.push({
        id: `act_${Date.now()}`,
        time: timeSlotSelect ? timeSlotSelect.value : "04:00 PM",
        title,
        type: "adventure",
        outdoor: outdoorInput ? outdoorInput.checked : true,
        intensity,
        fatigueCost,
        duration: "1.5 hrs",
        completed: false,
      });

      this.saveState();
      if (this.activityModal) this.activityModal.classList.remove("active");
      const actModalEl = document.getElementById("add-activity-modal");
      if (actModalEl) actModalEl.classList.remove("active");
      if (titleInput) titleInput.value = "";

      this.renderItinerary();
      this.renderFatigue();
      this.showToast(`📝 "${title}" added to Day ${currentDay.dayNumber}!`);
    }
  }

  showToast(message) {
    if (!this.toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>🔔</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  copyToClipboard(text, successMsg) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showToast(`📋 ${successMsg}`);
      })
      .catch(() => {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        this.showToast(`📋 ${successMsg}`);
      });
  }

  initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(".anim-on-scroll").forEach((el) => {
      observer.observe(el);
    });
  }

  triggerScrollAnimations() {
    const newEls = document.querySelectorAll(
      ".anim-on-scroll:not(.scroll-visible)",
    );
    newEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40) {
        el.classList.add("scroll-visible");
      }
    });
  }

  triggerCelebration() {
    const canvas = this.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = "block";

    const particles = [];
    const colors = [
      "#10b981",
      "#06b6d4",
      "#6366f1",
      "#ec4899",
      "#f59e0b",
      "#ffffff",
      "#a5b4fc",
    ];

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.8) * 20,
        size: Math.random() * 9 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.3,
        alpha: 1,
        decay: Math.random() * 0.012 + 0.006,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = "none";
      }
    };

    animate();
  }
  initChatbot() {
    const TRAVEL_KB = [
      {
        keys: ["swat", "mingora", "malam jabba", "kalam"],
        response:
          "🏔️ <strong>Swat Valley</strong> is absolutely beautiful! Must-visit spots:\n• <strong>Malam Jabba</strong> — Pakistan's best ski resort (May-Oct trekking)\n• <strong>Kalam</strong> — 7000ft elevation, crystal rivers\n• <strong>Bahrain Bazaar</strong> — local crafts & trout fish\n• <strong>White Palace Museum</strong>\n\nBest time: <strong>April-October</strong>. Carry warm clothes even in summer!",
      },
      {
        keys: ["hunza", "karimabad", "attabad", "rakaposhi"],
        response:
          "🌄 <strong>Hunza Valley</strong> — Heaven on Earth!\n• <strong>Attabad Lake</strong> — turquoise blue water, boat rides\n• <strong>Baltit Fort</strong> — 700 year old heritage\n• <strong>Eagle's Nest</strong> — best viewpoint in Pakistan\n• <strong>Rakaposhi View</strong> — 7788m peak\n\nBest time: <strong>May-September</strong>. Book hotels 2 months ahead!",
      },
      {
        keys: ["skardu", "deosai", "shangrila", "k2", "baltoro"],
        response:
          "🏜️ <strong>Skardu</strong> is truly magical!\n• <strong>Deosai National Park</strong> — world's 2nd highest plateau\n• <strong>Shangrila Resort</strong> — Lake in a Cup\n• <strong>Satpara Lake</strong> — crystal clear\n• <strong>K2 Base Camp</strong> — for serious trekkers\n\nAltitude: 2400m — acclimatize for 1-2 days on arrival!",
      },
      {
        keys: ["pack", "packing", "carry", "bring", "essentials", "luggage"],
        response:
          "🎒 <strong>Essential Packing List for Mountain Trips:</strong>\n\n🧥 <strong>Clothing:</strong> Waterproof jacket, thermals, hiking boots\n💊 <strong>Medical:</strong> Altitude sickness pills, pain killers, bandages\n🔋 <strong>Tech:</strong> Powerbank (20000mAh), offline maps downloaded\n💰 <strong>Money:</strong> Carry cash — ATMs are rare in valleys\n📱 <strong>Connectivity:</strong> Jazz SIM works best in Northern areas\n🕶️ <strong>Accessories:</strong> Sunglasses (UV at altitude), sunscreen SPF 50+",
      },
      {
        keys: [
          "budget",
          "cost",
          "cheap",
          "expensive",
          "price",
          "money",
          "rupees",
        ],
        response:
          "💸 <strong>Pakistan Mountain Trip Budget Guide:</strong>\n\n💰 <strong>Economy (Rs 8,000-12,000/day):</strong>\n• Local guesthouses, shared jeeps, local food\n\n💎 <strong>Standard (Rs 15,000-25,000/day):</strong>\n• Mid-range hotels, private transport\n\n👑 <strong>Comfort (Rs 35,000+/day):</strong>\n• Serena/premium hotels, private jeep hire\n\n🚐 <strong>Key Costs:</strong>\n• Islamabad→Swat bus: Rs 800-1200\n• Islamabad→Hunza flight: Rs 8,000-15,000\n• Local jeep hire/day: Rs 5,000-8,000",
      },
      {
        keys: [
          "weather",
          "rain",
          "season",
          "climate",
          "temperature",
          "when to visit",
          "best time",
        ],
        response:
          "🌤️ <strong>Pakistan Mountain Seasons:</strong>\n\n🌸 <strong>Spring (Mar-May):</strong> Flowers blooming, mild weather, less tourists\n☀️ <strong>Summer (Jun-Aug):</strong> Peak season, warm days, cool nights\n🍂 <strong>Autumn (Sep-Oct):</strong> Golden colors, clear skies — BEST season!\n❄️ <strong>Winter (Nov-Feb):</strong> Snow, road closures, cold (-10°C in Skardu)\n\n✅ <strong>Recommended:</strong> September-October for best experience!",
      },
      {
        keys: [
          "food",
          "eat",
          "restaurant",
          "local dish",
          "cuisine",
          "chapli",
          "karahi",
        ],
        response:
          "🍲 <strong>Must-Try Foods in Northern Pakistan:</strong>\n\n• <strong>Chapli Kabab</strong> — Peshawari specialty, must try!\n• <strong>Trout Fish</strong> — Fresh from Swat/Kalam rivers\n• <strong>Kehwa</strong> — Green tea with saffron & cardamom\n• <strong>Maash Ki Daal</strong> — Local mountain lentils\n• <strong>Bread (Roti)</strong> — Stone-baked, absolutely delicious\n• <strong>Apricot Jam</strong> — Hunza specialty\n\n💡 Tip: Eat at local dhabas for authentic & budget-friendly meals!",
      },
      {
        keys: [
          "hotel",
          "stay",
          "accommodation",
          "guesthouse",
          "camping",
          "sleep",
        ],
        response:
          "🏨 <strong>Accommodation Options:</strong>\n\n🏕️ <strong>Budget (Rs 2,000-5,000/night):</strong> Local guesthouses, camping\n🏩 <strong>Mid-range (Rs 8,000-15,000):</strong> Tourist lodges, PTDC hotels\n🏰 <strong>Luxury (Rs 25,000+):</strong> Serena Hotels, Shangrila Resort\n\n📋 <strong>Pro Tips:</strong>\n• Book 2-3 months ahead for peak season\n• Serena Swat & Serena Hunza are excellent\n• Camping in Deosai is a lifetime experience!",
      },
      {
        keys: ["safety", "safe", "secure", "dangerous", "risk", "trouble"],
        response:
          "🛡️ <strong>Safety Guide for Northern Pakistan:</strong>\n\n✅ Northern Pakistan is <strong>very safe</strong> for tourists!\n\n📋 <strong>Essential Safety Tips:</strong>\n• Register at PTDC office on arrival\n• Share your location with family daily\n• Download offline maps (Maps.me or Google Offline)\n• Carry emergency numbers: Police 15, Rescue 1122\n• Check road conditions before departing\n• Carry extra fuel in remote areas\n\n🆘 <strong>Emergency:</strong> Our SOS Sheet has all local numbers!",
      },
      {
        keys: [
          "pro",
          "upgrade",
          "premium",
          "features",
          "plan",
          "buy",
          "meezan",
        ],
        response:
          "👑 <strong>WanderWise PRO Features:</strong>\n\n🌍 Unlimited custom destination search\n⚡ AI Fatigue Engine & energy tracking\n☔ Rain Mode with 100+ indoor alternatives\n💸 Unlimited FairShare debt groups\n🚨 Printable offline SOS emergency sheets\n🌦️ Live satellite weather radar\n💬 Priority AI chat support\n☁️ Cloud backup & multi-device sync\n\n💳 <strong>Price: Rs 100 only (one-time)</strong> (Meezan Bank)\n📱 Account: <strong>03046942398</strong>\n\nGo to PRO tab to upgrade!",
      },
    ];

    this._travelKB = TRAVEL_KB;
  }

  sendChatMessage() {
    if (!this.chatbotInputEl) return;
    const msg = this.chatbotInputEl.value.trim();
    if (!msg) return;

    this.chatbotInputEl.value = "";
    this.appendChatMessage("user", msg);

    const typingEl = this.appendTypingIndicator();

    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      if (typingEl && typingEl.parentNode)
        typingEl.parentNode.removeChild(typingEl);
      const response = this.getAIResponse(msg);
      this.appendChatMessage("bot", response);
    }, delay);
  }

  getAIResponse(query) {
    const q = query.toLowerCase();
    const trip = this.state.trip;
    const dest = trip.destination || null;
    const dep = trip.departureCity || null;
    const budget = trip.totalBudget || 0;
    const members = this.state.members;
    const days = this.state.itineraryDays.length;

    if (/my trip|mera trip|current trip|my plan/.test(q)) {
      if (!dest)
        return `\ud83d\uddfa\ufe0f You haven't set up your trip yet! Go to <strong>Trip Setup</strong> and enter your departure city, destination, budget and dates.`;
      return `\ud83d\uddfa\ufe0f <strong>Your Current Trip:</strong><br>\ud83d\udea9 From: <strong>${dep || "Not set"}</strong><br>\ud83d\udccd To: <strong>${dest}</strong><br>\ud83d\udcc5 Dates: <strong>${trip.datesDisplay || "Not set"}</strong><br>\ud83d\udcb0 Budget: <strong>${this.formatMoney(budget)}</strong><br>\ud83d\udc65 Members: <strong>${members.length}</strong><br>\u26a1 Days: <strong>${days}</strong>`;
    }
    if (
      /my budget|budget kya|funds|remaining|balance|kitna paisa|spent/.test(q)
    ) {
      if (!budget)
        return `\ud83d\udcb0 No budget set yet! Go to Trip Setup and enter your total trip budget.`;
      const spent = this.state.expenses.reduce(
        (s, e) => s + Number(e.amount),
        0,
      );
      const rem = budget - spent;
      return `\ud83d\udcb8 <strong>Budget Status:</strong><br>\ud83d\udcb0 Total: <strong>${this.formatMoney(budget)}</strong><br>\ud83d\udcb3 Spent: <strong>${this.formatMoney(spent)}</strong><br>\ud83c\udfe6 Remaining: <strong style="color:#6ee7b7;">${this.formatMoney(rem)}</strong><br>\ud83d\udc65 Per person: <strong>${this.formatMoney(Math.round(budget / (members.length || 1)))}</strong>`;
    }
    if (/member|team|group|squad|kaun|who is/.test(q)) {
      if (members.length === 0)
        return `\ud83d\udc65 No members added yet! Go to <strong>FairShare Budget</strong> and click "+ Add Member".`;
      return `\ud83d\udc65 <strong>Your Squad (${members.length}):</strong><br>${members.map((m) => m.name).join("<br>")}`;
    }
    if (/countdown|kitne din|days left|kab|departure day/.test(q)) {
      if (!trip.startDate)
        return `\ud83d\udcc5 No trip date set yet. Go to Trip Setup to add dates!`;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tripDate = new Date(trip.startDate);
      tripDate.setHours(0, 0, 0, 0);
      const diff = Math.ceil((tripDate - today) / 86400000);
      if (diff > 0)
        return `\ud83d\ude80 <strong>${diff} days</strong> until your trip to <strong>${dest}</strong>! Get excited! \ud83c\udf89`;
      if (diff === 0)
        return `\ud83c\udf89 Your trip to <strong>${dest}</strong> starts <strong>TODAY</strong>! Have an amazing journey!`;
      return `\ud83d\uddfa\ufe0f Trip to <strong>${dest}</strong> started ${Math.abs(diff)} days ago. Hope you're having fun!`;
    }
    if (/score|readiness|complete|setup karo/.test(q)) {
      const done = [
        dep,
        dest,
        trip.startDate,
        budget > 0,
        members.length > 0,
        this.state.expenses.length > 0,
      ].filter(Boolean).length;
      const pct = Math.round((done / 6) * 100);
      return `\ud83c\udfaf <strong>Trip Readiness: ${pct}%</strong><br>${pct >= 75 ? "\u2705 Great setup!" : "\u26a0\ufe0f Needs more setup!"} Check the Readiness Score card on the home page for full breakdown.`;
    }
    if (/hello|hi |salam|hey|assalam|namaste/.test(q)) {
      return `\ud83d\udc4b <strong>Assalam u Alaikum!</strong> I'm your WanderWise AI \ud83e\udded<br><br>Ask me about:<br>\u2022 Destinations (Swat, Hunza, Skardu...)<br>\u2022 Budget & costs<br>\u2022 Packing lists<br>\u2022 Food & safety<br>\u2022 "my trip" - your trip summary<br>\u2022 "my budget" - budget status<br>\u2022 "countdown" - days to trip`;
    }

    if (this._travelKB) {
      for (const entry of this._travelKB) {
        if (entry.keys.some((k) => q.includes(k))) {
          return entry.response.replace(/\n/g, "<br>");
        }
      }
    }

    const fallbacks = dest
      ? [
          `\ud83d\udca1 For <strong>${dest}</strong>, check the Smart Itinerary tab for your ${days}-day schedule! \ud83d\uddd3\ufe0f`,
          `Your trip: <strong>${dep || "?"}</strong> \u2192 <strong>${dest}</strong> (${days} days, ${this.formatMoney(budget)}). Explore the tabs!`,
          `Ask me: "my trip", "my budget", "packing tips", "safety", "food", or "countdown"!`,
        ]
      : [
          `\ud83d\uddfa\ufe0f Start by setting up your trip in <strong>Trip Setup</strong> — enter departure city & destination first!`,
          `\ud83d\udca1 Ask me about Swat, Hunza, Skardu, or type "my trip" once you set up your journey.`,
        ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
  appendChatMessage(role, html) {
    if (!this.chatbotMessages) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg ${role}`;
    const avatarEl = document.createElement("div");
    avatarEl.className = "chat-msg-avatar";
    avatarEl.textContent = role === "bot" ? "🧭" : "👤";
    const bubbleEl = document.createElement("div");
    bubbleEl.className = "chat-bubble";
    bubbleEl.innerHTML = html;
    msgDiv.appendChild(avatarEl);
    msgDiv.appendChild(bubbleEl);
    this.chatbotMessages.appendChild(msgDiv);
    this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    return msgDiv;
  }

  appendTypingIndicator() {
    if (!this.chatbotMessages) return null;
    const wrapper = document.createElement("div");
    wrapper.className = "chat-msg bot";
    wrapper.innerHTML = `
      <div class="chat-msg-avatar">🧭</div>
      <div class="chat-typing"><span></span><span></span><span></span></div>
    `;
    this.chatbotMessages.appendChild(wrapper);
    this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    return wrapper;
  }
}

function initWanderWiseApp() {
  if (!window.app) {
    window.app = new WanderWiseApp();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWanderWiseApp);
} else {
  initWanderWiseApp();
}

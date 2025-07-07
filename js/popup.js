// Main application class
class KnowledgeBaseUploader {
  constructor() {
    this.currentView = 'list'; // 'list' or 'form'
    this.currentBatch = null;
    this.currentStep = 1;
    this.maxSteps = 4;
    this.batches = [];
    this.formData = this.getEmptyFormData();
    
    this.init();
  }

  async init() {
    await this.loadBatches();
    this.renderApp();
    this.bindEvents();
  }

  // Get empty form data
  getEmptyFormData() {
    return {
      basicInfo: {
        employeeId: '1907694139648851969',
        name: 'Taylor Zhang',
        company: 'ITEM',
        department: 'IT',
        position: 'BA',
        facility: ''
      },
      files: [],
      links: [],
      documentDetails: {
        companyDepartment: '',
        process: '',
        processName: '',
        customer: 'General',
        retailer: 'None',
        description: ''
      }
    };
  }

  // Load batch data
  async loadBatches() {
    try {
      const result = await chrome.storage.local.get(['batches']);
      this.batches = result.batches || [];
    } catch (error) {
      console.error('Failed to load batch data:', error);
      this.batches = [];
    }
  }

  // Save batch data
  async saveBatches() {
    try {
      await chrome.storage.local.set({ batches: this.batches });
    } catch (error) {
      console.error('Failed to save batch data:', error);
      this.showToast('Save failed', 'error');
    }
  }

  // Render application
  renderApp() {
    const root = document.getElementById('root');
    
    if (this.currentView === 'list') {
      root.innerHTML = this.renderBatchList();
    } else if (this.currentView === 'form') {
      root.innerHTML = this.renderStepForm();
    }
  }

  // Render batch list
  renderBatchList() {
    const batchCards = this.batches.map((batch, index) => `
      <div class="batch-card">
        <div class="batch-header">
          <div class="batch-title">${batch.name || `Batch ${index + 1}`}</div>
        </div>
        <div class="batch-info">
          <div class="batch-meta">
            <span class="meta-tag">${batch.files?.length || 0} files</span>
            ${batch.formData?.links?.length > 0 ? `<span class="meta-tag">${batch.formData.links.length} links</span>` : ''}
          </div>
        </div>
        <div class="batch-actions">
          <button class="btn btn-secondary btn-sm edit-batch-btn" data-index="${index}">Edit</button>
          <button class="btn btn-danger btn-sm delete-batch-btn" data-index="${index}">Delete</button>
        </div>
      </div>
    `).join('');

    return `
      <div class="main-content">
        <button class="btn btn-primary btn-full" id="createNewBatchBtn">
          + Create New Upload Batch
        </button>
        
        ${this.batches.length > 0 ? `
          <div class="batch-list">
            ${batchCards}
          </div>
          <button class="btn btn-success btn-full" id="submitAllBatchesBtn">
            Submit All Batches
          </button>
        ` : `
          <div class="empty-state">
            <div class="empty-icon">📁</div>
            <div class="empty-title">No Upload Batches</div>
            <div class="empty-description">Click the button above to create your first batch</div>
          </div>
        `}
        
        <!-- User Avatar Component -->
        <div class="user-avatar-container">
          <div class="user-avatar" id="userAvatar">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjdlZWEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwIDMyQzEwIDI2LjQ3NzIgMTQuNDc3MiAyMiAyMkMyNS41MjI4IDIyIDMwIDI2LjQ3NzIgMzAgMzJIMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" alt="User Avatar" class="avatar-image">
            <div class="user-status-dot"></div>
          </div>
          <div class="user-dropdown" id="userDropdown">
            <div class="user-info">
              <div class="user-name">${this.formData.basicInfo.name}</div>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" id="logoutBtn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 14H3C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11 11L14 8L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Sign Out
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render step form
  renderStepForm() {
    const progress = (this.currentStep / this.maxSteps) * 100;
    
    return `

      <div class="main-content">
        <div class="form-container">
          <div class="form-header">
            <div class="form-title">${this.currentBatch !== null ? 'Edit' : 'Create'} Upload Batch</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="step-indicator">Step ${this.currentStep}/${this.maxSteps}</div>
          </div>
          <div class="form-content">
            ${this.renderCurrentStep()}
          </div>
          <div class="form-navigation">
            <div class="nav-left">
              <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
              ${this.currentStep > 1 ? '<button class="btn btn-secondary" id="previousStepBtn">Previous</button>' : ''}
            </div>
            <div class="nav-right">
              ${this.currentStep < this.maxSteps ? 
                '<button class="btn btn-primary" id="nextStepBtn">Next</button>' : 
                '<button class="btn btn-success" id="saveBatchBtn">Save Batch</button>'
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render current step
  renderCurrentStep() {
    switch (this.currentStep) {
      case 1:
        return this.renderBasicInfoStep();
      case 2:
        return this.renderFileUploadStep();
      case 3:
        return this.renderDocumentDetailsStep();
      case 4:
        return this.renderConfirmationStep();
      default:
        return '';
    }
  }

  // Step 1: Basic Information
  renderBasicInfoStep() {
    const data = this.formData.basicInfo;
    return `
      <div class="form-group">
        <label class="form-label">Employee ID</label>
        <input type="text" class="form-input" id="employeeId" value="${data.employeeId}" placeholder="Enter Employee ID">
        <div class="form-error" id="employeeId-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label required">Name</label>
        <input type="text" class="form-input" id="name" value="${data.name}" placeholder="Enter Name">
        <div class="form-error" id="name-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Company</label>
        <input type="text" class="form-input" id="company" value="${data.company}" placeholder="Enter Company">
        <div class="form-error" id="company-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Department</label>
        <select class="form-select" id="department">
          <option value="">Select Department</option>
          <option value="IT" ${data.department === 'IT' ? 'selected' : ''}>IT</option>
          <option value="HR" ${data.department === 'HR' ? 'selected' : ''}>HR</option>
          <option value="Finance" ${data.department === 'Finance' ? 'selected' : ''}>Finance</option>
          <option value="Marketing" ${data.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
          <option value="Sales" ${data.department === 'Sales' ? 'selected' : ''}>Sales</option>
          <option value="Operations" ${data.department === 'Operations' ? 'selected' : ''}>Operations</option>
        </select>
        <div class="form-error" id="department-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Position</label>
        <input type="text" class="form-input" id="position" value="${data.position}" placeholder="Enter Position">
        <div class="form-error" id="position-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Facility</label>
        <input type="text" class="form-input" id="facility" value="${data.facility}" placeholder="Enter Facility">
        <div class="form-error" id="facility-error"></div>
      </div>
    `;
  }

  // Step 2: Files & Links Upload
  renderFileUploadStep() {
    const fileItems = this.formData.files.map((file, index) => `
      <div class="file-item">
        <div class="file-info">
          <div class="file-icon">${this.getFileIcon(file.name)}</div>
          <div class="file-details">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${this.formatFileSize(file.size)}</div>
          </div>
        </div>
        <button class="file-remove" data-index="${index}" data-type="file">×</button>
      </div>
    `).join('');

    const linkItems = this.formData.links.map((link, index) => `
      <div class="link-item">
        <div class="link-icon">🔗</div>
        <div class="link-url">${link}</div>
        <button class="link-remove" data-index="${index}" data-type="link">×</button>
      </div>
    `).join('');

    return `
      <div class="form-group">
        <label class="form-label required">Files & Links Upload</label>
        <div class="file-upload-area" id="fileUploadArea">
          <div class="upload-icon">📁</div>
          <div class="upload-text">Choose One/Multiple or drag and drop them here</div>
          <div class="upload-hint">Supports: PDF, Word, PPTX, Excel, CSV, JSON, Text, Markdown, HTML, PNG, JPEG, TIFF, BMP, HEIC.</div>
        </div>
        <input type="file" id="fileInput" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif" style="display: none;">
        <div class="form-error" id="files-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Add URL Links</label>
        <input type="url" class="form-input" id="urlInput" placeholder="Enter URL and press Enter to add" />
        <div class="form-error" id="links-error"></div>
      </div>
      
      ${this.formData.files.length > 0 || this.formData.links.length > 0 ? `
        <div class="file-list">
          ${fileItems}
          ${linkItems}
        </div>
      ` : ''}
    `;
  }

  // Step 3: Document Details
  renderDocumentDetailsStep() {
    const data = this.formData.documentDetails;
    return `
      <div class="form-group">
        <label class="form-label required">Company/Department</label>
        <select class="form-select" id="companyDepartment">
          <option value="">Select Company/Department</option>
          <option value="UNIS Drop Description" ${data.companyDepartment === 'UNIS Drop Description' ? 'selected' : ''}>UNIS Drop Description</option>
          <option value="UNIS Warehouse" ${data.companyDepartment === 'UNIS Warehouse' ? 'selected' : ''}>UNIS Warehouse</option>
          <option value="UNIS Transportation" ${data.companyDepartment === 'UNIS Transportation' ? 'selected' : ''}>UNIS Transportation</option>
          <option value="UNIS Yard Management" ${data.companyDepartment === 'UNIS Yard Management' ? 'selected' : ''}>UNIS Yard Management</option>
          <option value="UNIS Accounting" ${data.companyDepartment === 'UNIS Accounting' ? 'selected' : ''}>UNIS Accounting</option>
          <option value="UNIS HR" ${data.companyDepartment === 'UNIS HR' ? 'selected' : ''}>UNIS HR</option>
          <option value="UNIS IT" ${data.companyDepartment === 'UNIS IT' ? 'selected' : ''}>UNIS IT</option>
          <option value="UNIS Cubework" ${data.companyDepartment === 'UNIS Cubework' ? 'selected' : ''}>UNIS Cubework</option>
          <option value="UNIS LSO" ${data.companyDepartment === 'UNIS LSO' ? 'selected' : ''}>UNIS LSO</option>
          <option value="UNIS CubeShip" ${data.companyDepartment === 'UNIS CubeShip' ? 'selected' : ''}>UNIS CubeShip</option>
          <option value="UNIS Customer" ${data.companyDepartment === 'UNIS Customer' ? 'selected' : ''}>UNIS Customer</option>
          <option value="UNIS Employee Duties and Workflows" ${data.companyDepartment === 'UNIS Employee Duties and Workflows' ? 'selected' : ''}>UNIS Employee Duties and Workflows</option>
        </select>
        <div class="form-error" id="companyDepartment-error"></div>
      </div>

      <div class="form-group">
        <label class="form-label required">Process</label>
        <select class="form-select" id="process">
          <option value="">Select Process</option>
          <option value="Warehouse Operations" ${data.process === 'Warehouse Operations' ? 'selected' : ''}>Warehouse Operations</option>
          <option value="Inventory Management" ${data.process === 'Inventory Management' ? 'selected' : ''}>Inventory Management</option>
          <option value="Order Processing" ${data.process === 'Order Processing' ? 'selected' : ''}>Order Processing</option>
          <option value="Shipping & Delivery" ${data.process === 'Shipping & Delivery' ? 'selected' : ''}>Shipping & Delivery</option>
          <option value="Quality Control" ${data.process === 'Quality Control' ? 'selected' : ''}>Quality Control</option>
          <option value="Returns Processing" ${data.process === 'Returns Processing' ? 'selected' : ''}>Returns Processing</option>
          <option value="Safety & Compliance" ${data.process === 'Safety & Compliance' ? 'selected' : ''}>Safety & Compliance</option>
        </select>
        <div class="form-error" id="process-error"></div>
      </div>

      <div class="form-group">
        <label class="form-label required">Name of the Process</label>
        <input type="text" class="form-input" id="processName" value="${data.processName || ''}" placeholder="Enter process name">
        <div class="form-error" id="processName-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label required">Customer</label>
        <select class="form-select" id="customer">
          <option value="">Select Customer</option>
          <option value="General" ${data.customer === 'General' ? 'selected' : ''}>General</option>
          <option value="Customer A" ${data.customer === 'Customer A' ? 'selected' : ''}>Customer A</option>
          <option value="Customer B" ${data.customer === 'Customer B' ? 'selected' : ''}>Customer B</option>
          <option value="Customer C" ${data.customer === 'Customer C' ? 'selected' : ''}>Customer C</option>
          <option value="Internal Customer" ${data.customer === 'Internal Customer' ? 'selected' : ''}>Internal Customer</option>
        </select>
        <div class="form-error" id="customer-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label required">Retailer</label>
        <select class="form-select" id="retailer">
          <option value="">Select Retailer</option>
          <option value="None" ${data.retailer === 'None' ? 'selected' : ''}>None</option>
          <option value="Retailer A" ${data.retailer === 'Retailer A' ? 'selected' : ''}>Retailer A</option>
          <option value="Retailer B" ${data.retailer === 'Retailer B' ? 'selected' : ''}>Retailer B</option>
          <option value="Retailer C" ${data.retailer === 'Retailer C' ? 'selected' : ''}>Retailer C</option>
        </select>
        <div class="form-error" id="retailer-error"></div>
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-textarea" id="description" placeholder="Enter document description (optional)">${data.description || ''}</textarea>
        <div class="form-error" id="description-error"></div>
      </div>
    `;
  }

  // Step 4: Confirmation
  renderConfirmationStep() {
    const data = this.formData;
    
    return `
      <div class="confirmation-section">
        <div class="confirmation-title">Basic Information</div>
        <div class="confirmation-item">
          <span class="confirmation-label">Employee ID:</span>
          <span class="confirmation-value">${data.basicInfo.employeeId}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">Name:</span>
          <span class="confirmation-value">${data.basicInfo.name}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">Company:</span>
          <span class="confirmation-value">${data.basicInfo.company}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">Department:</span>
          <span class="confirmation-value">${data.basicInfo.department}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">Position:</span>
          <span class="confirmation-value">${data.basicInfo.position}</span>
        </div>
        ${data.basicInfo.facility ? `
          <div class="confirmation-item">
            <span class="confirmation-label">Facility:</span>
            <span class="confirmation-value">${data.basicInfo.facility}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="confirmation-section">
        <div class="confirmation-title">Uploaded Files (${data.files.length})</div>
        ${data.files.map(file => `
          <div class="confirmation-item">
            <span class="confirmation-label">${this.getFileIcon(file.name)} ${file.name}</span>
            <span class="confirmation-value">${this.formatFileSize(file.size)}</span>
          </div>
        `).join('')}
      </div>
      
      ${data.links.length > 0 ? `
        <div class="confirmation-section">
          <div class="confirmation-title">Added Links (${data.links.length})</div>
          ${data.links.map(link => `
            <div class="confirmation-item">
              <span class="confirmation-label">🔗 ${link}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="confirmation-section">
        <div class="confirmation-title">Document Details</div>
        ${data.documentDetails.companyDepartment ? `
          <div class="confirmation-item">
            <span class="confirmation-label">Company/Department:</span>
            <span class="confirmation-value">${data.documentDetails.companyDepartment}</span>
          </div>
        ` : ''}
        <div class="confirmation-item">
          <span class="confirmation-label">Process:</span>
          <span class="confirmation-value">${data.documentDetails.process}</span>
        </div>
        ${data.documentDetails.processName ? `
          <div class="confirmation-item">
            <span class="confirmation-label">Name of the Process:</span>
            <span class="confirmation-value">${data.documentDetails.processName}</span>
          </div>
        ` : ''}
        <div class="confirmation-item">
          <span class="confirmation-label">Customer:</span>
          <span class="confirmation-value">${data.documentDetails.customer}</span>
        </div>
        <div class="confirmation-item">
          <span class="confirmation-label">Retailer:</span>
          <span class="confirmation-value">${data.documentDetails.retailer}</span>
        </div>
        ${data.documentDetails.description ? `
          <div class="confirmation-item">
            <span class="confirmation-label">Description:</span>
            <span class="confirmation-value">${data.documentDetails.description}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Bind events
  bindEvents() {
    // Remove old event listeners
    this.removeAllEventListeners();
    
    // Main button events
    this.bindMainButtons();
    
    // File upload related events
    this.bindFileUploadEvents();

    // Form field change events
    this.bindFormFieldEvents();

    // Batch operation events
    this.bindBatchActions();
  }

  // Remove all event listeners
  removeAllEventListeners() {
    // Clean up specific listeners as needed
  }

  // Bind main button events
  bindMainButtons() {
    const createNewBatchBtn = document.getElementById('createNewBatchBtn');
    if (createNewBatchBtn) {
      createNewBatchBtn.addEventListener('click', () => this.createNewBatch());
    }

    const submitAllBatchesBtn = document.getElementById('submitAllBatchesBtn');
    if (submitAllBatchesBtn) {
      submitAllBatchesBtn.addEventListener('click', () => this.submitAllBatches());
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.goToList());
    }

    const nextStepBtn = document.getElementById('nextStepBtn');
    if (nextStepBtn) {
      nextStepBtn.addEventListener('click', () => this.nextStep());
    }

    const previousStepBtn = document.getElementById('previousStepBtn');
    if (previousStepBtn) {
      previousStepBtn.addEventListener('click', () => this.previousStep());
    }

    const saveBatchBtn = document.getElementById('saveBatchBtn');
    if (saveBatchBtn) {
      saveBatchBtn.addEventListener('click', () => this.saveBatch());
    }

    // User avatar events
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userAvatar && userDropdown) {
      // Toggle dropdown on avatar click
      userAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('show');
        }
      });
    }

    if (logoutBtn) {
      // Handle logout click (placeholder - no actual action as requested)
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Placeholder for logout action - no actual implementation as requested
        console.log('Logout clicked - no action implemented');
      });
    }
  }

  // Bind file upload events
  bindFileUploadEvents() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const urlInput = document.getElementById('urlInput');
    
    if (fileUploadArea && fileInput) {
      fileUploadArea.addEventListener('click', () => fileInput.click());
      fileUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
      fileUploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
      fileUploadArea.addEventListener('drop', this.handleDrop.bind(this));
      fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    }

    // URL input events
    if (urlInput) {
      urlInput.addEventListener('keypress', this.handleUrlInput.bind(this));
    }

    // File remove buttons
    const fileRemoveBtns = document.querySelectorAll('.file-remove');
    fileRemoveBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.removeFile(index);
      });
    });

    // Link remove buttons
    const linkRemoveBtns = document.querySelectorAll('.link-remove');
    linkRemoveBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.removeLink(index);
      });
    });
  }

  // Bind batch action events
  bindBatchActions() {
    // Edit batch buttons
    const editBtns = document.querySelectorAll('.edit-batch-btn');
    editBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.editBatch(index);
      });
    });

    // Delete batch buttons
    const deleteBtns = document.querySelectorAll('.delete-batch-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.deleteBatch(index);
      });
    });
  }

  // Bind form field events
  bindFormFieldEvents() {
    // Basic info fields
    ['employeeId', 'name', 'company', 'department', 'position', 'facility'].forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('input', () => {
          this.formData.basicInfo[fieldId] = field.value;
          this.clearFieldError(fieldId);
        });
      }
    });

    // Document details fields
    ['companyDepartment', 'process', 'processName', 'customer', 'retailer', 'description'].forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('input', () => {
          this.formData.documentDetails[fieldId] = field.value;
          this.clearFieldError(fieldId);
        });
      }
    });
  }

  // File drag handling
  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    this.addFiles(files);
  }

  // File selection handling
  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.addFiles(files);
  }

  // Add files
  addFiles(files) {
    const validFiles = files.filter(file => this.validateFile(file));
    this.formData.files.push(...validFiles);
    this.renderApp();
    this.bindEvents();
  }

  // Validate file
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];

    if (file.size > maxSize) {
      this.showToast('File size cannot exceed 10MB', 'error');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      this.showToast('Unsupported file type', 'error');
      return false;
    }

    return true;
  }

  // Remove file
  removeFile(index) {
    this.formData.files.splice(index, 1);
    this.renderApp();
    this.bindEvents();
  }

  // Get file icon
  getFileIcon(filename) {
    if (!filename || typeof filename !== 'string') {
      return '📎'; // 返回默认图标
    }
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️'
    };
    return iconMap[ext] || '📎';
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get status text
  getStatusText(status) {
    const statusMap = {
      draft: 'Draft',
      submitted: 'Submitted',
      failed: 'Failed'
    };
    return statusMap[status] || 'Unknown';
  }

  // Navigation methods
  createNewBatch() {
    this.currentView = 'form';
    this.currentBatch = null;
    this.currentStep = 1;
    this.formData = this.getEmptyFormData();
    this.renderApp();
    this.bindEvents();
  }

  editBatch(index) {
    this.currentView = 'form';
    this.currentBatch = index;
    this.currentStep = 1;
    this.formData = { ...this.batches[index].formData };
    this.renderApp();
    this.bindEvents();
  }

  async deleteBatch(index) {
    if (confirm('Are you sure you want to delete this batch?')) {
      this.batches.splice(index, 1);
      await this.saveBatches();
      this.renderApp();
      this.bindEvents();
      this.showToast('Batch deleted', 'success');
    }
  }

  goToList() {
    this.currentView = 'list';
    this.renderApp();
    this.bindEvents();
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      this.currentStep++;
      this.renderApp();
      this.bindEvents();
    }
  }

  previousStep() {
    this.currentStep--;
    this.renderApp();
    this.bindEvents();
  }

  // Validate current step
  validateCurrentStep() {
    let isValid = true;

    if (this.currentStep === 1) {
      // Validate basic information - only Name is required
      if (!this.formData.basicInfo.name.trim()) {
        this.showFieldError('name', 'Please enter name');
        isValid = false;
      }
    } else if (this.currentStep === 2) {
      // Validate file upload - either files or links are required
      if (this.formData.files.length === 0 && this.formData.links.length === 0) {
        this.showFieldError('files', 'Please upload at least one file or add at least one link');
        isValid = false;
      }
    } else if (this.currentStep === 3) {
      // Validate document details
      if (!this.formData.documentDetails.process) {
        this.showFieldError('process', 'Please select an associated process');
        isValid = false;
      }
      if (!this.formData.documentDetails.customer) {
        this.showFieldError('customer', 'Please select a customer');
        isValid = false;
      }
    }

    return isValid;
  }

  // Show field error
  showFieldError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  // Clear field error
  clearFieldError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  // Save batch
  async saveBatch() {
    const batchData = {
      id: Date.now(),
      name: `Batch ${this.batches.length + 1}`,
      formData: { ...this.formData },
      files: [...this.formData.files],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.currentBatch !== null) {
      // Edit existing batch
      this.batches[this.currentBatch] = {
        ...this.batches[this.currentBatch],
        formData: batchData.formData,
        files: batchData.files,
        updatedAt: batchData.updatedAt
      };
    } else {
      // Create new batch
      this.batches.push(batchData);
    }

    await this.saveBatches();
    this.showToast('Batch saved successfully', 'success');
    this.goToList();
  }

  // Submit all batches
  async submitAllBatches() {
    const draftBatches = this.batches.filter(batch => batch.status === 'draft');
    
    if (draftBatches.length === 0) {
      this.showToast('No batches to submit', 'warning');
      return;
    }

    if (!confirm(`Are you sure you want to submit ${draftBatches.length} batches?`)) {
      return;
    }

    this.showToast('Starting batch submission...', 'info');
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < this.batches.length; i++) {
      if (this.batches[i].status === 'draft') {
        try {
          const result = await this.submitBatch(this.batches[i]);
          this.batches[i].status = 'submitted';
          this.batches[i].submittedAt = new Date().toISOString();
          this.batches[i].submissionResult = result;
          successCount++;
          
          // Show progress feedback
          this.showToast(`Batch ${i + 1} submitted successfully`, 'success');
        } catch (error) {
          console.error('Failed to submit batch:', error);
          this.batches[i].status = 'failed';
          this.batches[i].submissionError = error.message;
          failCount++;
          
          // Show error feedback
          this.showToast(`Batch ${i + 1} failed: ${error.message}`, 'error');
        }
      }
    }

    // Final summary
    if (failCount === 0) {
      this.showToast(`All ${successCount} batches submitted successfully!`, 'success');
    } else {
      this.showToast(`${successCount} succeeded, ${failCount} failed. Please check failed batches.`, 'warning');
    }

    // Clear all batches after submission (only if all succeeded)
    if (failCount === 0) {
      this.batches = [];
    }
    
    await this.saveBatches();
    this.renderApp();
    this.bindEvents();
  }

  // Submit single batch
  async submitBatch(batch) {
    // Simulate API call - for demo purposes, always succeed
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // For demonstration, always succeed
        // In real implementation, this would be an actual API call
        try {
          // Simulate API validation
          if (!batch || !batch.formData) {
            reject(new Error('Invalid batch data'));
            return;
          }
          
          // Simulate successful upload
          resolve({ 
            success: true, 
            message: 'Upload successful',
            batchId: batch.id,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          reject(new Error(`Upload failed: ${error.message}`));
        }
      }, 1000 + Math.random() * 1000); // 1-2 seconds delay
    });
  }

  // Show notification
  showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Handle URL input
  handleUrlInput(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const url = e.target.value.trim();
      if (url && this.validateUrl(url)) {
        this.addLink(url);
        e.target.value = '';
      }
    }
  }

  // Add link
  addLink(url) {
    if (!this.formData.links.includes(url)) {
      this.formData.links.push(url);
      this.renderApp();
      this.bindEvents();
      this.clearFieldError('links');
    } else {
      this.showToast('This URL has already been added', 'warning');
    }
  }

  // Remove link
  removeLink(index) {
    this.formData.links.splice(index, 1);
    this.renderApp();
    this.bindEvents();
  }

  // Validate URL
  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      this.showToast('Please enter a valid URL', 'error');
      return false;
    }
  }
}

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new KnowledgeBaseUploader();
}); 
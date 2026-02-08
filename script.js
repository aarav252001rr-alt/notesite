// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Initialize question papers page functionality
    if (document.querySelector('.papers-container')) {
        initializePapersPage();
    }
});

// Question Papers Page Functionality
async function initializePapersPage() {
    try {
        // Try to load papers from JSON file
        const response = await fetch('papers.json');
        if (!response.ok) {
            throw new Error('papers.json not found');
        }
        window.papersData = await response.json();
        console.log('Papers data loaded from JSON');
    } catch (error) {
        console.warn('Could not load papers.json, using fallback data:', error);
        // Fallback data if JSON file doesn't exist
        window.papersData = getFallbackPapersData();
    }
    
    // Class, Medium, and Subject data
    const subjectsData = {
        '10th': ['Hindi', 'English', 'Science', 'Math', 'Sanskrit'],
        '12th': ['Hindi', 'English', 'Physics', 'Chemistry', 'Math', 'Biology']
    };

    // Get DOM elements
    const classOptions = document.querySelectorAll('.class-option');
    const mediumOptions = document.querySelectorAll('.medium-option');
    const subjectOptions = document.getElementById('subjectOptions');
    const papersGrid = document.getElementById('papersGrid');
    const selectedInfo = document.getElementById('selectedInfo');

    // Current selections
    let currentClass = '10th';
    let currentMedium = 'english';
    let currentSubject = null;

    // Initialize
    updateSubjectOptions();
    updatePapersDisplay();

    // Class selection
    classOptions.forEach(option => {
        option.addEventListener('click', function() {
            classOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentClass = this.dataset.class;
            currentSubject = null;
            updateSubjectOptions();
            updatePapersDisplay();
        });
    });

    // Medium selection
    mediumOptions.forEach(option => {
        option.addEventListener('click', function() {
            mediumOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentMedium = this.dataset.medium;
            updatePapersDisplay();
        });
    });

    // Update subject options based on class
    function updateSubjectOptions() {
        subjectOptions.innerHTML = '';
        const subjects = subjectsData[currentClass];
        
        subjects.forEach(subject => {
            const button = document.createElement('button');
            button.className = 'subject-option';
            if (subject === currentSubject) {
                button.classList.add('active');
            }
            button.textContent = subject;
            button.dataset.subject = subject;
            
            button.addEventListener('click', function() {
                document.querySelectorAll('.subject-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                this.classList.add('active');
                currentSubject = subject;
                updatePapersDisplay();
            });
            
            subjectOptions.appendChild(button);
        });
    }

    // Update papers display
    function updatePapersDisplay() {
        // Update selected info text
        const mediumText = currentMedium === 'english' ? 'English Medium' : 'Hindi Medium';
        let infoText = `${currentClass} | ${mediumText}`;
        
        if (currentSubject) {
            infoText += ` | ${currentSubject}`;
        }
        
        selectedInfo.textContent = infoText;

        // Clear current papers
        papersGrid.innerHTML = '';

        // If no subject selected, show prompt
        if (!currentSubject) {
            papersGrid.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-search"></i>
                    <h3>Select a subject to view question papers</h3>
                    <p>Choose from the available subjects above</p>
                </div>
            `;
            return;
        }

        // Get papers for current selection from JSON data
        const papersForSubject = window.papersData?.[currentClass]?.[currentMedium]?.[currentSubject];
        
        if (!papersForSubject || Object.keys(papersForSubject).length === 0) {
            papersGrid.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>No papers available for this selection</h3>
                    <p>Please try a different subject or medium</p>
                </div>
            `;
            return;
        }

        // Create paper cards from JSON data
        Object.entries(papersForSubject).forEach(([year, paperInfo]) => {
            const paperCard = createPaperCard(year, paperInfo);
            papersGrid.appendChild(paperCard);
        });
    }

    // Create paper card element with data from JSON
    function createPaperCard(year, paperInfo) {
        const card = document.createElement('div');
        card.className = 'paper-card';
        
        const mediumText = currentMedium === 'english' ? 'English' : 'Hindi';
        const paperUrl = paperInfo.url || '#';
        const fileName = paperInfo.fileName || `${currentClass}_${currentSubject}_${year}.pdf`;
        const fileSize = paperInfo.fileSize || 'N/A';
        const pages = paperInfo.pages || 'N/A';
        const quality = paperInfo.quality || 'Good';
        
        card.innerHTML = `
            <div class="paper-header">
                <div class="paper-info">
                    <div class="paper-subject">${currentSubject} 
                        <span class="quality-badge">${quality}</span>
                    </div>
                    <div class="paper-details">
                        <span>Class: ${currentClass}</span>
                        <span>Medium: ${mediumText}</span>
                        <span>Year: ${year}</span>
                    </div>
                    <div class="paper-stats">
                        <div class="paper-stat">
                            <i class="fas fa-file-pdf"></i> ${fileSize}
                        </div>
                        <div class="paper-stat">
                            <i class="fas fa-file-alt"></i> ${pages} pages
                        </div>
                    </div>
                </div>
                <div class="paper-year">${year}</div>
            </div>
            <div class="paper-meta">
                <p>MP Board Question Paper</p>
                <p>Official Previous Year Paper</p>
            </div>
            <button class="download-btn" onclick="downloadPaper('${paperUrl}', '${fileName}')">
                <i class="fas fa-download"></i> Download Paper
            </button>
            ${paperInfo.preview ? `
                <button class="preview-btn" onclick="previewPaper('${paperInfo.preview}')">
                    <i class="fas fa-eye"></i> Preview
                </button>
            ` : ''}
        `;
        
        return card;
    }

    // Fallback data if papers.json doesn't exist
    function getFallbackPapersData() {
        return {
            '10th': {
                'english': {
                    'Hindi': {
                        '2022': {
                            'url': 'papers/10th/english/Hindi/2022.pdf',
                            'fileName': 'MP_Board_10th_Hindi_2022.pdf',
                            'fileSize': '1.2 MB',
                            'pages': '12',
                            'quality': 'Excellent',
                            'preview': 'papers/10th/english/Hindi/2022_preview.jpg'
                        },
                        '2021': {
                            'url': 'papers/10th/english/Hindi/2021.pdf',
                            'fileName': 'MP_Board_10th_Hindi_2021.pdf',
                            'fileSize': '1.1 MB',
                            'pages': '10',
                            'quality': 'Good'
                        }
                    },
                    'Science': {
                        '2022': {
                            'url': 'papers/10th/english/Science/2022.pdf',
                            'fileName': 'MP_Board_10th_Science_2022.pdf',
                            'fileSize': '1.5 MB',
                            'pages': '15',
                            'quality': 'Excellent'
                        }
                    }
                }
            },
            '12th': {
                'english': {
                    'Physics': {
                        '2022': {
                            'url': 'papers/12th/english/Physics/2022.pdf',
                            'fileName': 'MP_Board_12th_Physics_2022.pdf',
                            'fileSize': '2.1 MB',
                            'pages': '18',
                            'quality': 'Excellent'
                        }
                    }
                }
            }
        };
    }
}

// Download paper function - Now uses URL from JSON
window.downloadPaper = function(paperUrl, fileName) {
    if (paperUrl === '#') {
        alert('Paper URL not available. Please check back later.');
        return;
    }
    
    // Create a temporary anchor element for download
    const link = document.createElement('a');
    link.href = paperUrl;
    link.download = fileName;
    link.target = '_blank';
    
    // Add to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Optional: Track download
    console.log(`Download initiated: ${fileName}`);
};

// Preview paper function
window.previewPaper = function(previewUrl) {
    // Create preview modal
    const modal = document.createElement('div');
    modal.className = 'paper-preview-modal';
    modal.innerHTML = `
        <div class="preview-modal-content">
            <div class="preview-header">
                <h3>Paper Preview</h3>
                <button class="close-preview">&times;</button>
            </div>
            <div class="preview-body">
                <img src="${previewUrl}" alt="Paper Preview" style="max-width: 100%; height: auto;">
                <p class="preview-note">Note: This is a preview. Download the full PDF for complete paper.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
        .paper-preview-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .preview-modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
        }
        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #eee;
        }
        .preview-header h3 {
            margin: 0;
            color: #333;
        }
        .close-preview {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #666;
        }
        .preview-body {
            padding: 1.5rem;
        }
        .preview-note {
            margin-top: 1rem;
            font-style: italic;
            color: #666;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-preview');
    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
};

// Also update the CSS to add styles for the new elements
// Add this to your existing style.css:
const newStyles = `
/* Quality Badge */
.quality-badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    background: #4CAF50;
    color: white;
    border-radius: 12px;
    font-size: 0.8rem;
    margin-left: 0.5rem;
    font-weight: 600;
}

/* Paper Stats */
.paper-stats {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #666;
}

.paper-stat {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

/* Preview Button */
.preview-btn {
    display: block;
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.6rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.preview-btn:hover {
    background: #5a6268;
}

.download-btn + .preview-btn {
    margin-top: 0.5rem;
}
`;

// Inject the new styles into the document
const styleSheet = document.createElement('style');
styleSheet.textContent = newStyles;
document.head.appendChild(styleSheet);

document.addEventListener('DOMContentLoaded', function() {
    // Parts list with squad member recommendations
    const partsList = [
        {
            name: 'Frame & Chassis',
            description: 'Aluminum alloy 6061 T4/T6 frame, similar to Sur-Ron X Light Bee design',
            stock: 'Sur-Ron uses forged aluminum with anodic oxidation',
            upgrade: 'Consider reinforced frame to handle the 72V power increase',
            squadTip: {
                member: 'Charlie',
                quote: 'Go with the stronger rear subframe. Trust me, I\'ve broken two stock ones.'
            }
        },
        {
            name: 'Motor',
            description: 'High-performance PMSM mid-drive motor (5-6kW range)',
            stock: 'Sur-Ron X uses 60V PMSM motor with 4300rpm rated speed',
            upgrade: '72V compatible motor with improved cooling system',
            squadTip: {
                member: 'TBD',
                quote: 'QS138 90H with forced air cooling is optimal. 20% efficiency increase observed.'
            }
        },
        {
            name: 'Battery',
            description: '72V lithium-ion battery pack, 30-40Ah capacity',
            stock: 'Sur-Ron uses 60V 32A Panasonic/Samsung cells',
            upgrade: '72V configuration requires 20S battery pack with quality cells',
            squadTip: {
                member: 'Billy',
                quote: 'Make sure it\'s waterproof. Would hate to fry it when we cross that creek behind my place.'
            }
        },
        {
            name: 'Controller',
            description: '72V sine wave controller (100A+ capacity)',
            stock: 'Sur-Ron uses 60V sine wave controller',
            upgrade: 'Upgraded controller with programming capabilities',
            squadTip: {
                member: 'TBD',
                quote: 'Sabvoton 72150 with cooling fins. Heat-mapped in all conditions.'
            }
        },
        {
            name: 'Suspension',
            description: 'Inverted front forks with adjustable damping, rear shock with linkage',
            stock: 'Sur-Ron uses inverted forks with 8" travel and DNM TR rear shock',
            upgrade: 'Consider fully adjustable suspension for higher speeds',
            squadTip: {
                member: 'Charlie',
                quote: 'DNM USD-8 forks up front and a proper motorcycle rear shock. Makes hitting jumps way more fun.'
            }
        },
        {
            name: 'Brakes',
            description: '4-piston hydraulic disc brakes (front and rear)',
            stock: 'Sur-Ron uses 4-piston hydraulic disc brakes',
            upgrade: 'Larger rotors for improved heat dissipation',
            squadTip: {
                member: 'Billy',
                quote: 'Don\'t cheap out here. You\'ll need these when Charlie talks you into something stupid.'
            }
        },
        {
            name: 'Transmission',
            description: 'Primary belt with secondary chain drive (upgraded #420 or #428 chain)',
            stock: 'Sur-Ron uses 1:7.6 ratio with Continental belt and #420 chain',
            upgrade: 'Consider stronger chain and sprockets for higher torque',
            squadTip: {
                member: 'TBD',
                quote: 'Documented 17:48 gearing provides optimal balance of acceleration and top speed.'
            }
        },
        {
            name: 'Wheels & Tires',
            description: '19" spoke wheels with all-terrain tires',
            stock: 'Sur-Ron uses 19x1.4 alloy hubs with 70/100-19 CST tires',
            upgrade: 'Consider stronger spokes and rims for durability',
            squadTip: {
                member: 'Charlie',
                quote: 'Shinko 241 tires all the way. Billy got me hooked on these for muddy trails.'
            }
        },
        {
            name: 'Electrical Components',
            description: 'LCD display, LED lights, horn, wiring harness',
            stock: 'Sur-Ron includes digital speedometer and USB port',
            upgrade: 'Waterproof connectors and higher gauge wiring for 72V system',
            squadTip: {
                member: 'Billy',
                quote: 'Add a GPS tracker. Charlie lost his bike in the woods twice last month.'
            }
        },
        {
            name: 'Charger',
            description: '72V fast charger (10A+)',
            stock: 'Sur-Ron uses 60V 10A charger (3hr charge time)',
            upgrade: '72V 10A+ charger with adjustable current option',
            squadTip: {
                member: 'TBD',
                quote: 'Multiple charging profiles recommended. 80% for daily use extends cell life 47%.'
            }
        }
    ];
    
    // Render parts list with squad tips if on the right page
    const listElement = document.getElementById('parts-list');
    if (listElement) {
        renderPartsList(listElement);
    }
    
    // Handle spec comparison toggle if on a page with specs
    const specComparisonBtn = document.getElementById('spec-comparison-btn');
    const specTable = document.getElementById('spec-table');
    if (specComparisonBtn && specTable) {
        specComparisonBtn.addEventListener('click', function() {
            if (specTable.style.display === 'none') {
                specTable.style.display = 'table';
                this.textContent = 'Hide Specifications';
            } else {
                specTable.style.display = 'none';
                this.textContent = 'Show Specifications';
            }
        });
    }
    
    // Add build progress tracker if on squad garage page
    const buildSection = document.getElementById('build-process');
    if (buildSection) {
        addProgressTracker(buildSection);
        addMilestones(buildSection);
    }
    
    // Add keyboard shortcut for spec table
    if (specTable) {
        document.addEventListener('keydown', function(e) {
            // 'S' key shows/hides specs
            if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
                if (specTable.style.display === 'none') {
                    specTable.style.display = 'table';
                    specComparisonBtn.textContent = 'Hide Specifications';
                } else {
                    specTable.style.display = 'none';
                    specComparisonBtn.textContent = 'Show Specifications';
                }
            }
        });
    }
    
    // Add interactive squad members click handlers
    const squadMembers = document.querySelectorAll('.squad-member');
    squadMembers.forEach(member => {
        member.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // Get member name
            const memberName = this.querySelector('h3').textContent.split(' ')[0].toLowerCase();
            
            // Get a random quote for this member
            const randomQuote = getRandomQuoteFor(memberName);
            
            // Update quote
            const quoteElement = this.querySelector('.quote');
            if (quoteElement) {
                // Fade out
                quoteElement.style.opacity = 0;
                
                // Change quote and fade in
                setTimeout(function() {
                    quoteElement.textContent = `"${randomQuote}"`;
                    quoteElement.style.opacity = 1;
                }, 300);
            }
        });
    });
    
    // Change quotes every 30 seconds
    setIntervalWithCleanup(rotateQuotes, 30000);
    
    // Save/load builds if we're on the parts selector page
    const buildNameInput = document.getElementById('build-name');
    const saveButton = document.getElementById('save-build');
    const shareButton = document.getElementById('share-build');
    
    if (buildNameInput && saveButton && shareButton) {
        // Check for saved builds when page loads
        loadSavedBuilds();
        
        // Set up save button
        saveButton.addEventListener('click', saveBuild);
        
        // Set up share button
        shareButton.addEventListener('click', shareBuild);
    }
    
    // Helper Functions
    
    function renderPartsList(container) {
        partsList.forEach(part => {
            const li = document.createElement('li');
            li.className = 'part-item';
            
            // Create title element
            const title = document.createElement('h3');
            title.textContent = part.name;
            
            // Create description
            const description = document.createElement('p');
            description.className = 'description';
            description.textContent = part.description;
            
            // Create stock specs
            const stock = document.createElement('p');
            stock.className = 'stock';
            stock.innerHTML = '<strong>Stock Sur-Ron:</strong> ' + part.stock;
            
            // Create upgrade notes
            const upgrade = document.createElement('p');
            upgrade.className = 'upgrade';
            upgrade.innerHTML = '<strong>72V Upgrade:</strong> ' + part.upgrade;
            
            // Create squad tip
            const squadTip = document.createElement('div');
            squadTip.className = 'squad-tip ' + part.squadTip.member.toLowerCase();
            squadTip.innerHTML = `
                <div class="squad-tip-header">
                    <span class="squad-member-icon">${part.squadTip.member.charAt(0)}</span>
                    <span class="squad-member-name">${part.squadTip.member}'s Tip:</span>
                </div>
                <p class="squad-tip-quote">"${part.squadTip.quote}"</p>
            `;
            
            // Append all elements
            li.appendChild(title);
            li.appendChild(description);
            li.appendChild(stock);
            li.appendChild(upgrade);
            li.appendChild(squadTip);
            
            container.appendChild(li);
        });
    }
    
    function addProgressTracker(container) {
        const progressTracker = document.createElement('div');
        progressTracker.className = 'progress-tracker';
        progressTracker.innerHTML = `
            <h3>Squad Build Progress</h3>
            <div class="progress-bars">
                <div class="progress-item">
                    <span class="progress-label">Charlie's Build</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar charlie" style="width: 85%"></div>
                    </div>
                    <span class="progress-percent">85%</span>
                </div>
                <div class="progress-item">
                    <span class="progress-label">Billy's Build</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar billy" style="width: 42%"></div>
                    </div>
                    <span class="progress-percent">42%</span>
                </div>
                <div class="progress-item">
                    <span class="progress-label">TBD's Build</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar tbd" style="width: 98%"></div>
                    </div>
                    <span class="progress-percent">98%</span>
                </div>
            </div>
        `;
        
        container.appendChild(progressTracker);
    }
    
    function addMilestones(container) {
        const milestone = document.createElement('div');
        milestone.className = 'build-milestones';
        milestone.innerHTML = `
            <h3>Upcoming Squad Milestones</h3>
            <ul class="milestone-list">
                <li class="milestone">
                    <div class="milestone-date">Apr 15</div>
                    <div class="milestone-content">
                        <h4>Group Ride Test</h4>
                        <p>First squad ride with all builds at Devil's Ridge</p>
                    </div>
                </li>
                <li class="milestone">
                    <div class="milestone-date">May 3</div>
                    <div class="milestone-content">
                        <h4>Speed Testing</h4>
                        <p>Timed runs at abandoned airstrip</p>
                    </div>
                </li>
                <li class="milestone">
                    <div class="milestone-date">May 22</div>
                    <div class="milestone-content">
                        <h4>Endurance Challenge</h4>
                        <p>100-mile ride through Westridge Trail System</p>
                    </div>
                </li>
            </ul>
        `;
        
        container.appendChild(milestone);
    }

    // Squad member quotes for random rotation
    const squadQuotes = {
        charlie: [
            "If you're not breaking parts, you're not riding hard enough.",
            "Just because you can hit 60mph doesn't mean you should. But you totally should.",
            "Can we overvolt it? Let's do it anyway.",
            "Let's overvolt it. What's the worst that could happen? Third-degree burns are just spicy memories."
        ],
        billy: [
            "Added a fishing rod holder to mine. Multi-purpose vehicle now.",
            "If we get caught, I'm telling them you forced me into this.",
            "I'd rather fish, but I guess we're building bikes. Again.",
            "Make sure it fits in the truck. And has a place for my tackle box."
        ],
        tbd: [
            "Battery temperature during jumps exceeds recommended parameters. Fascinating.",
            "Statistical analysis indicates a 97% chance Charlie crashes today.",
            "Heat mapping complete. Proceed.",
            "Parts compatibility matrix loaded. Efficiency optimization at 97.3%."
        ]
    };
    
    function getRandomQuoteFor(member) {
        const quotes = squadQuotes[member];
        if (!quotes) return "...";
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
    
    function rotateQuotes() {
        const members = Object.keys(squadQuotes);
        const randomMember = members[Math.floor(Math.random() * members.length)];
        const randomQuote = getRandomQuoteFor(randomMember);
        
        const memberElement = document.querySelector(`.squad-member.${randomMember}`);
        if (memberElement) {
            const quoteElement = memberElement.querySelector('.quote');
            if (quoteElement) {
                // Fade out
                quoteElement.style.opacity = 0;
                
                // Change quote and fade in
                setTimeout(function() {
                    quoteElement.textContent = `"${randomQuote}"`;
                    quoteElement.style.opacity = 1;
                }, 300);
            }
        }
    }
    
    // Helper for interval that can be cleared on page unload
    function setIntervalWithCleanup(callback, delay) {
        const interval = setInterval(callback, delay);
        window.addEventListener('beforeunload', function() {
            clearInterval(interval);
        });
        return interval;
    }

    // Functions for saving and sharing builds
    function saveBuild() {
        try {
            // Get the build name and parts
            const buildName = document.getElementById('build-name').value || "My Sur-Ron Build";
            const selectedParts = Array.from(document.querySelectorAll('#parts-select select')).map(select => {
                return {
                    category: select.dataset.category,
                    option: select.options[select.selectedIndex].textContent,
                    price: parseFloat(select.value)
                };
            });
            
            // Calculate total price
            const totalPrice = selectedParts.reduce((sum, part) => sum + part.price, 0);
            
            // Create build object
            const build = {
                name: buildName,
                totalPrice: totalPrice,
                parts: selectedParts,
                date: new Date().toISOString()
            };
            
            // Get existing builds or initialize empty array
            let savedBuilds = JSON.parse(localStorage.getItem('surronSquadBuilds') || '[]');
            
            // Add new build
            savedBuilds.push(build);
            
            // Save back to localStorage
            localStorage.setItem('surronSquadBuilds', JSON.stringify(savedBuilds));
            
            // Show success message
            alert(`"${buildName}" saved successfully!`);
            
        } catch (error) {
            console.error('Error saving build:', error);
            alert('Error saving build. Try again later.');
        }
    }
    
    function loadSavedBuilds() {
        try {
            // Check if we have saved builds
            const savedBuilds = JSON.parse(localStorage.getItem('surronSquadBuilds') || '[]');
            
            // If there are saved builds, check if we should suggest loading one
            if (savedBuilds.length > 0 && confirm('You have saved builds. Would you like to load your most recent build?')) {
                // Get most recent build
                const mostRecent = savedBuilds[savedBuilds.length - 1];
                
                // Set the build name
                document.getElementById('build-name').value = mostRecent.name;
                
                // TODO: Set the selections based on part names
                // This would require matching the part categories and options
                
                // Update the summary
                if (typeof updateSummary === 'function') {
                    updateSummary();
                }
            }
        } catch (error) {
            console.error('Error loading saved builds:', error);
        }
    }
    
    function shareBuild() {
        // In a real implementation, this would generate a shareable link
        // For now, just simulate it
        const buildName = document.getElementById('build-name').value || "My Sur-Ron Build";
        const totalPrice = document.getElementById('total-price').textContent;
        
        // Create a "shareable" string (in a real app, this would be a URL)
        const shareText = `Check out my Sur-Ron build "${buildName}" (${totalPrice})! It's 🔥`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareText)
            .then(() => {
                alert(`Copied to clipboard! In a real implementation, you'd get a shareable link.`);
            })
            .catch(() => {
                alert(`${shareText}\n\nSave this text to share (clipboard access denied)`);
            });
    }
});

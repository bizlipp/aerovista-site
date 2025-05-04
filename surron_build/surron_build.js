document.addEventListener('DOMContentLoaded', function() {
    const partsList = [
        {
            name: 'Frame & Chassis',
            description: 'Aluminum alloy 6061 T4/T6 frame, similar to Sur-Ron X Light Bee design',
            stock: 'Sur-Ron uses forged aluminum with anodic oxidation',
            upgrade: 'Consider reinforced frame to handle the 72V power increase'
        },
        {
            name: 'Motor',
            description: 'High-performance PMSM mid-drive motor (5-6kW range)',
            stock: 'Sur-Ron X uses 60V PMSM motor with 4300rpm rated speed',
            upgrade: '72V compatible motor with improved cooling system'
        },
        {
            name: 'Battery',
            description: '72V lithium-ion battery pack, 30-40Ah capacity',
            stock: 'Sur-Ron uses 60V 32A Panasonic/Samsung cells',
            upgrade: '72V configuration requires 20S battery pack with quality cells (Samsung 35E/40T or similar)'
        },
        {
            name: 'Controller',
            description: '72V sine wave controller (100A+ capacity)',
            stock: 'Sur-Ron uses 60V sine wave controller',
            upgrade: 'Upgraded controller with programming capabilities and higher amperage rating'
        },
        {
            name: 'Suspension',
            description: 'Inverted front forks with adjustable damping, rear shock with linkage',
            stock: 'Sur-Ron uses inverted forks with 8" travel and DNM TR rear shock',
            upgrade: 'Consider fully adjustable suspension for higher speeds'
        },
        {
            name: 'Brakes',
            description: '4-piston hydraulic disc brakes (front and rear)',
            stock: 'Sur-Ron uses 4-piston hydraulic disc brakes',
            upgrade: 'Larger rotors for improved heat dissipation and stopping power'
        },
        {
            name: 'Transmission',
            description: 'Primary belt with secondary chain drive (upgraded #420 or #428 chain)',
            stock: 'Sur-Ron uses 1:7.6 ratio with Continental belt and #420 chain',
            upgrade: 'Consider stronger chain and sprockets for higher torque'
        },
        {
            name: 'Wheels & Tires',
            description: '19" spoke wheels with all-terrain tires',
            stock: 'Sur-Ron uses 19x1.4 alloy hubs with 70/100-19 CST tires',
            upgrade: 'Consider stronger spokes and rims for durability'
        },
        {
            name: 'Electrical Components',
            description: 'LCD display, LED lights, horn, wiring harness',
            stock: 'Sur-Ron includes digital speedometer and USB port',
            upgrade: 'Waterproof connectors and higher gauge wiring for 72V system'
        },
        {
            name: 'Charger',
            description: '72V fast charger (10A+)',
            stock: 'Sur-Ron uses 60V 10A charger (3hr charge time)',
            upgrade: '72V 10A+ charger with adjustable current option'
        }
    ];
    
    const listElement = document.getElementById('parts-list');
    
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
        
        // Append all elements
        li.appendChild(title);
        li.appendChild(description);
        li.appendChild(stock);
        li.appendChild(upgrade);
        
        listElement.appendChild(li);
    });
    
    // Add spec comparison section
    const specComparisonBtn = document.getElementById('spec-comparison-btn');
    const specTable = document.getElementById('spec-table');
    
    if (specComparisonBtn) {
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
});

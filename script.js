async function fetchData(endpoint, method = "GET", body = null) {
    try {
        const options = { method, headers: { "Content-Type": "application/json" } };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`http://localhost:3000/${endpoint}`, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Failed to fetch data. Check console for details.");
        return [];
    }
}

async function displayItems(tableId, endpoint, deleteFunction) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    table.innerHTML = "";

    const response = await fetchData(endpoint);
    const items = response.data; // Extracting actual data

    if (!items || items.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.innerText = "No items found.";
        cell.style.textAlign = "center";
        return;
    }

    items.forEach(item => {
        const row = table.insertRow();
        row.insertCell().innerText = item.name;
        row.insertCell().innerText = item.quantity;

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deleteFunction(item.id);
        row.insertCell().appendChild(deleteBtn);
    });
}

async function addItem(endpoint, tableId, deleteFunction) {
    const name = prompt("Enter item name:");
    const quantity = prompt("Enter quantity:");

    if (name && name.trim() !== "" && quantity && quantity.trim() !== "") {
        const quantityNum = Number(quantity);
        if (isNaN(quantityNum)) {
            alert("Invalid quantity. Please enter a number.");
            return;
        }

        await fetchData(endpoint, "POST", { name: name.trim(), quantity: quantityNum });
        displayItems(tableId, endpoint, deleteFunction);
    }
}

async function deleteItem(endpoint, id, tableId, displayFunction) {
    if (confirm("Are you sure you want to delete this item?")) {
        await fetchData(`${endpoint}/${id}`, "DELETE");
        displayFunction(tableId, endpoint, deleteItem.bind(null, endpoint));
    }
}

// Updated endpoints matching backend table names
async function addGrocery() {
    await addItem("groceries", "groceriesTable", deleteGrocery);
}

async function deleteGrocery(id) {
    await deleteItem("groceries", id, "groceriesTable", displayItems);
}

async function addMonthly() {
    await addItem("monthlies", "monthliesTable", deleteMonthly);
}

async function deleteMonthly(id) {
    await deleteItem("monthlies", id, "monthliesTable", displayItems);
}

async function addElectrical() {
    await addItem("electrical", "electricalTable", deleteElectrical);
}

async function deleteElectrical(id) {
    await deleteItem("electrical", id, "electricalTable", displayItems);
}

// Money Usage Functions (Corrected to use "money")
async function addMoneyUsage() {
    const item = prompt("Enter expense item:");
    const cost = prompt("Enter cost:");

    if (item && item.trim() !== "" && cost && cost.trim() !== "") {
        const costNum = Number(cost);
        if (isNaN(costNum)) {
            alert("Invalid cost. Please enter a number.");
            return;
        }
        await fetchData("money", "POST", { item: item.trim(), cost: costNum });
        displayMoneyUsage();
    }
}

async function displayMoneyUsage() {
    const table = document.getElementById("moneyTable").getElementsByTagName('tbody')[0];
    table.innerHTML = "";

    const response = await fetchData("money");
    const expenses = response.data; // Extracting actual data
    let totalCost = 0;

    if (!expenses || expenses.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.innerText = "No expenses recorded.";
        cell.style.textAlign = "center";
        document.getElementById("totalCost").innerText = 0;
        return;
    }

    expenses.forEach(expense => {
        const row = table.insertRow();
        row.insertCell().innerText = expense.item;
        row.insertCell().innerText = expense.cost;
        totalCost += parseFloat(expense.cost);
    });

    document.getElementById("totalCost").innerText = totalCost.toFixed(2);
}

async function deleteMoneyUsage(id) {
    if (confirm("Are you sure you want to delete this expense?")) {
        await fetchData(`money/${id}`, "DELETE");
        displayMoneyUsage();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    displayItems("groceriesTable", "groceries", deleteGrocery);
    displayItems("monthliesTable", "monthlies", deleteMonthly);
    displayItems("electricalTable", "electrical", deleteElectrical);
    displayMoneyUsage();
});

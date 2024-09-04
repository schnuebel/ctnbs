let db;

// Open the IndexedDB database
const request = indexedDB.open('CalorieTrackerDB', 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('meals', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('name', 'name', { unique: false });
    objectStore.createIndex('calories', 'calories', { unique: false });
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log('IndexedDB initialized');
    renderMeals();
    renderTotalCalories();
};

request.onerror = function (event) {
    console.error('Error opening IndexedDB:', event);
};

// Function to add a meal
function addMeal(mealName, calories) {
    const transaction = db.transaction(['meals'], 'readwrite');
    const objectStore = transaction.objectStore('meals');
    const meal = { name: mealName, calories: parseInt(calories), date: new Date() };
    const request = objectStore.add(meal);

    request.onsuccess = function () {
        console.log('Meal added');
        renderMeals();
        renderTotalCalories();
    };

    request.onerror = function () {
        console.error('Error adding meal');
    };
}

// Function to delete a meal
function deleteMeal(id) {
    const transaction = db.transaction(['meals'], 'readwrite');
    const objectStore = transaction.objectStore('meals');
    const request = objectStore.delete(id);

    request.onsuccess = function () {
        console.log('Meal deleted');
        renderMeals();
        renderTotalCalories();
    };

    request.onerror = function () {
        console.error('Error deleting meal');
    };
}

// Function to render meals
function renderMeals() {
    const mealList = document.getElementById('meal-list');
    mealList.innerHTML = '';
    const transaction = db.transaction(['meals'], 'readonly');
    const objectStore = transaction.objectStore('meals');
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        const meals = event.target.result;
        meals.forEach(meal => {
            const li = document.createElement('li');
            li.innerHTML = `${meal.name} - ${meal.calories} kcal <button onclick="deleteMeal(${meal.id})">X</button>`;
            mealList.appendChild(li);
        });
    };

    request.onerror = function () {
        console.error('Error retrieving meals');
    };
}

// Function to calculate total calories
function renderTotalCalories() {
    const calorieTotalDisplay = document.getElementById('calorie-total');
    let totalCalories = 0;
    const transaction = db.transaction(['meals'], 'readonly');
    const objectStore = transaction.objectStore('meals');
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        const meals = event.target.result;
        meals.forEach(meal => {
            totalCalories += meal.calories;
        });
        calorieTotalDisplay.textContent = totalCalories;
    };

    request.onerror = function () {
        console.error('Error calculating total calories');
    };
}

// Handle form submission to add a meal
const calorieForm = document.getElementById('calorie-form');
calorieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mealName = document.getElementById('meal-name').value;
    const calories = document.getElementById('calories').value;
    if (mealName && calories) {
        addMeal(mealName, calories);
        calorieForm.reset();
    }
});

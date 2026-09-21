# Forecast & Ingredients Planner

Web-based application for **sales forecasting and ingredient demand planning** at **Djurnal Coffee Yogyakarta**.

This project was developed as a **Final Project (Tugas Akhir)** to help coffee shop management estimate future menu sales and calculate the required amount of ingredients based on sales forecasts and recipe compositions.

The system combines **time-series forecasting using ARIMA/AutoARIMA** with a **recipe-based ingredient planning system**.

---

## 📌 Overview

Managing ingredient inventory in a coffee shop requires an estimate of how many products will be sold in the future.

If the estimated demand is too high, the coffee shop may purchase excessive ingredients, resulting in:

* Over-stock
* Ingredient waste
* Higher inventory costs
* Expired ingredients

On the other hand, if the estimated demand is too low, the coffee shop may experience:

* Stock shortages
* Inability to fulfill customer orders
* Disrupted operations

Therefore, this project provides a system that uses historical sales data to forecast future menu demand and converts the forecasted sales into estimated ingredient requirements.

### Main workflow

```text
Historical Sales Data
        │
        ▼
Data Preprocessing
        │
        ▼
Sales Aggregation
        │
        ▼
ARIMA / AutoARIMA
        │
        ▼
Sales Forecast
        │
        ▼
Recipe Calculation
        │
        ▼
Ingredient Demand
        │
        ▼
Stock Planning
```

---

# 🎯 Project Objectives

The main objectives of this project are:

1. Forecast future sales of coffee shop menu items using historical sales data.
2. Implement ARIMA/AutoARIMA as a time-series forecasting method.
3. Calculate the estimated ingredient requirements based on forecasted menu sales.
4. Provide information that can assist inventory planning.
5. Provide a web-based interface for viewing forecasting and ingredient planning results.
6. Evaluate the forecasting performance using an appropriate error metric such as **MAPE (Mean Absolute Percentage Error)**.

---

# ✨ Features

## 1. Sales Data Management

The system processes historical sales data containing information such as:

* Sales date
* Menu name
* Quantity sold

Example:

| sales_date | menu              | qty |
| ---------- | ----------------- | --: |
| 2024-01-01 | Kopi Susu Batavia |  25 |
| 2024-01-02 | Kopi Susu Batavia |  30 |
| 2024-01-03 | Kopi Susu Batavia |  27 |

The sales data can be imported from a CSV file.

---

## 2. Data Preprocessing

Before forecasting, the sales data is processed to prepare it for time-series analysis.

The preprocessing process includes:

* Reading sales data
* Converting the sales date into a date/time format
* Filtering unnecessary categories
* Grouping sales data by date and menu
* Aggregating the quantity sold
* Preparing the time-series dataset

The following categories are excluded from the forecasting process:

```text
DJ MODIFIER
MISCELLANEOUS
```

---

## 3. Sales Forecasting

The system uses **ARIMA (AutoRegressive Integrated Moving Average)** for sales forecasting.

ARIMA consists of three main parameters:

```text
ARIMA(p, d, q)
```

Where:

* `p` = autoregressive order
* `d` = degree of differencing
* `q` = moving average order

The system can use **AutoARIMA** to determine an appropriate ARIMA configuration based on the available historical data.

### Example

For the menu:

```text
Kopi Susu Batavia
```

one of the tested models is:

```text
ARIMA(2,0,1)
```

with an AIC value of approximately:

```text
103.7698
```

The selected model is then used to generate future sales forecasts.

---

# 📊 Forecasting Period

The forecasting experiment uses the following data division:

### Training Data

```text
January 2024 – September 2024
```

The training data is used to build the forecasting model.

### Forecast Period

```text
October 2024 – September 2025
```

The model generates forecasts for this period.

### Evaluation Data

Actual sales data from:

```text
October 2024 – December 2024
```

is used to evaluate the forecasting results.

The evaluation is performed on:

```text
14 menu items
```

### Dataset division

```text
January 2024 ───────── September 2024
        │
        │ Training Data
        ▼
    ARIMA Model
        │
        ▼
October 2024 ───────── September 2025
        │
        │ Forecast
        │
        ├── October 2024
        ├── November 2024
        └── December 2024
                 │
                 ▼
          Actual Sales Data
                 │
                 ▼
             Evaluation
```

---

# 📈 Forecast Evaluation

The forecasting results are evaluated by comparing:

```text
Actual Sales
        vs
Forecasted Sales
```

One of the evaluation metrics used in this project is **MAPE (Mean Absolute Percentage Error)**.

The general formula is:

```text
MAPE = (100 / n) × Σ |(Actual - Forecast) / Actual|
```

Where:

* `Actual` = actual sales value
* `Forecast` = forecasted sales value
* `n` = number of observations

MAPE provides an indication of the forecasting error in percentage form.

### Example interpretation

If the calculated MAPE is:

```text
10%
```

this means that the average absolute percentage error between the actual and forecasted values is approximately 10%.

> The final interpretation of forecasting accuracy should be based on the actual evaluation results obtained from the system.

---

# 🧮 Ingredient Planning

One of the main features of this project is converting predicted menu sales into estimated ingredient requirements.

Each menu has a recipe consisting of several ingredients.

For example:

```text
Menu
└── Kopi Susu Batavia
    ├── Coffee
    ├── Milk
    ├── Sugar
    └── Ice
```

Each recipe item has a specific quantity.

For example:

```text
1 serving Kopi Susu Batavia
    Coffee = X gram
    Milk   = X ml
    Sugar  = X gram
    Ice    = X gram
```

If the forecast predicts:

```text
100 cups
```

then the required ingredient quantity can be calculated as:

```text
Ingredient Requirement
=
Forecasted Sales × Ingredient Quantity per Recipe
```

For example:

```text
Coffee requirement
=
100 × recipe coffee quantity
```

The same calculation is performed for each ingredient.

---

# 🧾 Recipe System

The ingredient planning functionality is based on recipe information stored in the database.

The main entities include:

```text
Ingredients
Recipes
Recipe Items
```

### Relationship

```text
Recipe
   │
   ├── Recipe Item
   │       └── Ingredient
   │
   ├── Recipe Item
   │       └── Ingredient
   │
   └── Recipe Item
           └── Ingredient
```

A recipe can contain multiple ingredients, while an ingredient can be used by multiple recipes.

---

# 🗄️ Database

The application uses **MySQL** as the database management system.

The project database is:

```text
forecast_ingredient_planner
```

The database stores information related to:

* Menu
* Ingredients
* Recipes
* Recipe items
* Sales data
* Forecasting results
* Other supporting data required by the application

The exact database schema may depend on the current implementation.

---

# 🏗️ System Architecture

The project consists of a frontend and backend application.

```text
┌──────────────────────────────┐
│          Frontend            │
│           Next.js            │
└──────────────┬───────────────┘
               │
               │ HTTP / API
               ▼
┌──────────────────────────────┐
│           Backend            │
│           FastAPI            │
│                              │
│  ┌────────────────────────┐  │
│  │ Data Processing        │  │
│  │ Pandas                 │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ Forecasting            │  │
│  │ ARIMA / AutoARIMA      │  │
│  └────────────────────────┘  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│            MySQL             │
│ forecast_ingredient_planner  │
└──────────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* **Next.js**
* JavaScript / TypeScript
* HTML
* CSS

## Backend

* **FastAPI**
* Python
* Pandas
* pmdarima

## Database

* **MySQL**

## Forecasting

* ARIMA
* AutoARIMA
* AIC
* MAPE

## Data Processing

* Pandas
* CSV

---

# 📁 Project Structure

The following is an example of the project structure:

```text
forecast-ingredient-planner/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── dataset/
│   └── sales.csv
│
├── database/
│   └── database.sql
│
└── README.md
```

> Struktur folder di atas dapat disesuaikan dengan struktur repository sebenarnya.

---

# 🚀 Installation

## Requirements

Make sure the following software is installed:

* Python 3.x
* Node.js
* npm
* MySQL
* Git

---

# 1. Clone Repository

```bash
git clone <REPOSITORY_URL>
```

Move into the project directory:

```bash
cd forecast-ingredient-planner
```

---

# 2. Backend Setup

Move to the backend directory:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
```

Activate:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 3. Backend Environment Configuration

Create a `.env` file inside the backend directory.

Example:

```env
DATABASE_URL=mysql+pymysql://username:password@localhost/forecast_ingredient_planner
```

Adjust the database configuration according to your local MySQL setup.

> Do not commit `.env` files containing passwords or other sensitive credentials to GitHub.

---

# 4. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE forecast_ingredient_planner;
```

Then import the database structure:

```bash
mysql -u username -p forecast_ingredient_planner < database.sql
```

Alternatively, the SQL file can be imported through:

* MySQL Workbench
* phpMyAdmin
* Another MySQL database management tool

---

# 5. Run Backend

From the backend directory:

```bash
uvicorn app.main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI also provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

---

# 6. Frontend Setup

Open another terminal and move to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

---

# 🔄 Application Workflow

The application workflow can be divided into several stages.

## Step 1 — Import Sales Data

Historical sales data is imported into the system.

```text
CSV
 │
 ▼
Sales Data
```

---

## Step 2 — Data Preprocessing

The system cleans and prepares the data.

```text
Raw Sales Data
      │
      ▼
Date Conversion
      │
      ▼
Filtering
      │
      ▼
Aggregation
      │
      ▼
Time-Series Data
```

---

## Step 3 — Forecasting

The historical data is processed using ARIMA/AutoARIMA.

```text
Historical Sales
       │
       ▼
ARIMA / AutoARIMA
       │
       ▼
Forecast Model
       │
       ▼
Future Sales
```

---

## Step 4 — Forecast Result

The system produces predicted sales quantities for each menu.

Example:

| Menu              | Forecast Period | Predicted Qty |
| ----------------- | --------------- | ------------: |
| Kopi Susu Batavia | October 2024    |            XX |
| Kopi Susu Batavia | November 2024   |            XX |
| Kopi Susu Batavia | December 2024   |            XX |

The actual values depend on the generated forecasting results.

---

## Step 5 — Recipe Calculation

The predicted quantity is connected with the recipe data.

```text
Predicted Menu Sales
        +
Recipe
        │
        ▼
Ingredient Requirement
```

---

## Step 6 — Ingredient Planning

The system calculates the total ingredient requirements.

Example:

| Ingredient | Required Quantity |
| ---------- | ----------------: |
| Coffee     |             XXX g |
| Milk       |            XXX ml |
| Sugar      |             XXX g |
| Ice        |             XXX g |

These values are based on the forecasted sales and recipe composition.

---

# 📊 Example Calculation

Suppose the forecast predicts:

```text
Kopi Susu Batavia = 500 cups
```

And the recipe requires:

```text
Coffee = 18 g / cup
Milk   = 100 ml / cup
Sugar  = 10 g / cup
```

Then:

### Coffee

```text
500 × 18 g
= 9,000 g
= 9 kg
```

### Milk

```text
500 × 100 ml
= 50,000 ml
= 50 L
```

### Sugar

```text
500 × 10 g
= 5,000 g
= 5 kg
```

Therefore, the estimated ingredient requirement is:

```text
Coffee = 9 kg
Milk   = 50 L
Sugar  = 5 kg
```

---

# 📐 ARIMA Method

ARIMA is a statistical model commonly used for time-series forecasting.

The model can be represented as:

```text
ARIMA(p,d,q)
```

### Parameter `p`

Represents the autoregressive component.

It determines how many previous observations are used by the model.

### Parameter `d`

Represents the degree of differencing.

Differencing is used to help make a non-stationary time series stationary.

### Parameter `q`

Represents the moving average component.

It determines how previous forecast errors are incorporated into the model.

---

# 🤖 AutoARIMA

The project can use AutoARIMA to automatically search for suitable ARIMA parameters.

Conceptually:

```text
Historical Data
      │
      ▼
AutoARIMA
      │
      ├── Test different p
      ├── Test different d
      └── Test different q
      │
      ▼
Candidate Models
      │
      ▼
Model Selection
      │
      ▼
Selected ARIMA Model
```

The model selection can use statistical criteria such as **AIC (Akaike Information Criterion)**.

---

# 📏 AIC

AIC is used to compare statistical models while considering both:

* Model fit
* Model complexity

In general:

```text
Lower AIC
   ↓
Better relative model fit
```

However, AIC should be interpreted as a model-selection criterion rather than as a direct measure of forecasting accuracy.

Forecasting performance is evaluated separately using actual observations and error metrics such as MAPE.

---

# 🧪 Testing and Evaluation

The system is evaluated using actual sales data.

The evaluation process consists of:

```text
Forecast Result
       │
       │
       ▼
Compare with
Actual Sales
       │
       ▼
Calculate Error
       │
       ▼
MAPE
```

The evaluation dataset consists of actual sales from:

```text
October 2024
November 2024
December 2024
```

for the selected **14 menu items**.

---

# 📋 Evaluation Output

The system can present evaluation results in a format such as:

| Menu   | Actual | Forecast | Error |
| ------ | -----: | -------: | ----: |
| Menu A |    XXX |      XXX |   XX% |
| Menu B |    XXX |      XXX |   XX% |
| Menu C |    XXX |      XXX |   XX% |

The final values should be generated from the actual experiment results.

---

# 🎨 User Interface

The frontend is designed to provide information related to:

* Sales forecasting
* Forecast results
* Menu information
* Recipe information
* Ingredient information
* Ingredient requirements
* Forecast evaluation

The interface is intended to make forecasting and ingredient planning easier to understand for users who manage coffee shop inventory.

---

# 🔌 API

The backend provides REST API endpoints through FastAPI.

The API is responsible for communication between:

```text
Frontend
   │
   ▼
FastAPI
   │
   ├── Sales Data
   ├── Forecasting
   ├── Recipes
   ├── Ingredients
   └── Planning
   │
   ▼
MySQL
```

Interactive API documentation can be accessed through:

```text
http://127.0.0.1:8000/docs
```

The exact endpoint list depends on the current backend implementation.

---

# 🔐 Environment Variables

Example environment configuration:

```env
DATABASE_URL=mysql+pymysql://username:password@localhost/forecast_ingredient_planner
```

For production deployment, additional environment variables may be required.

Never expose sensitive credentials in the source code.

---

# 📦 Main Dependencies

Backend:

```text
FastAPI
Uvicorn
Pandas
pmdarima
SQLAlchemy
PyMySQL
Python-dotenv
```

Frontend:

```text
Next.js
React
```

The exact versions should follow the project's `requirements.txt` and `package.json`.

---

# 🗂️ Dataset

The main sales dataset uses the following fields:

```text
sales_date
menu
qty
```

### Field Description

| Field        | Description             |
| ------------ | ----------------------- |
| `sales_date` | Date of the transaction |
| `menu`       | Name of the menu item   |
| `qty`        | Quantity sold           |

The dataset is used as the basis for time-series forecasting.

---

# ⚠️ Data Processing Notes

The following categories are excluded from forecasting:

```text
DJ MODIFIER
MISCELLANEOUS
```

This filtering is performed because these categories are not treated as regular menu products for the forecasting objective.

---

# 📌 Current Research Scope

The current project focuses on:

1. Historical sales data.
2. Menu-level sales forecasting.
3. ARIMA/AutoARIMA.
4. Forecast evaluation.
5. Recipe-based ingredient calculation.
6. Ingredient demand planning.
7. Web-based visualization and management.

The system is intended to support inventory planning and does not automatically guarantee optimal purchasing decisions.

---

# 👨‍💻 Development

This project was developed as a Final Project at:

**Politeknik Negeri Padang**

Program:

**Teknologi Informasi**

Project case:

**Djurnal Coffee Yogyakarta**

---

# 👤 Author

**Yondra Septian**

Politeknik Negeri Padang
Teknologi Informasi

---

# 📄 License

This project was developed for academic purposes as part of a Final Project.

If you intend to reuse, modify, or distribute this project, please contact the author first.

---

# 🙏 Acknowledgements

Special thanks to:

* Politeknik Negeri Padang
* Program Studi Teknologi Informasi
* Djurnal Coffee Yogyakarta
* Academic supervisors
* Everyone who contributed to the development and evaluation of this project

---

# 📚 Project Summary

In summary, **Forecast & Ingredients Planner** integrates sales forecasting and ingredient planning into a single web-based application.

The system uses historical sales data to build an ARIMA/AutoARIMA forecasting model:

```text
Historical Sales
      ↓
Data Preprocessing
      ↓
ARIMA / AutoARIMA
      ↓
Sales Forecast
      ↓
Recipe Mapping
      ↓
Ingredient Calculation
      ↓
Ingredient Planning
```

This approach allows predicted menu sales to be translated into estimated ingredient requirements, providing a data-driven basis for inventory planning at Djurnal Coffee Yogyakarta.

---

## 🔮 Future Development

Potential future improvements include:

* Improving forecasting accuracy through additional model comparisons.
* Adding more forecasting methods.
* Adding automated model evaluation.
* Adding additional forecasting metrics.
* Improving visualization of historical and forecasted sales.
* Adding stock-on-hand information.
* Adding minimum stock and safety stock calculations.
* Adding purchase recommendations.
* Adding automated reporting.
* Adding authentication and role-based access.
* Deploying the system to a production environment.

---

## 📞 Contact

For questions or further information regarding this project, please contact:

**Yondra Septian**

Politeknik Negeri Padang
Teknologi Informasi

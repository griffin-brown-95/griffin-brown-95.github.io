# Griffin Brown Portfolio

---

## Projects

### [Money Mop: Scalable Cashback Experimentation Pipeline](https://github.com/griffin-brown-95/money_mop)

Quick Overview:
- Databricks ELT Pipeline: Bronze ingestion of synthetic transactions → Silver enrichment with randomized A/B assignment & cashback policies → Gold aggregation of spend & cashback metrics.
- A/B Experiment Framework: Category-specific power & sample-size calculations (MDE, Cohen’s d) plus sequential-testing boundaries for early stopping.
- Delta-Backed Data Model: Tables for experiment design (information fractions & Z-score thresholds) and observed results, driving a “Z vs Information Fraction” dashboard.
- Production-Grade Architecture: Centralized YAML configs, shared Spark utilities, modular scripts, and Databricks Jobs for reliable, incremental runs.

---

### [Swire Coca-Cola Time Series Forecasting](https://github.com/griffin-brown-95/GLB-Capstone-2)

Quick Overview:
- EDA: Found planned maintenance takes significantly less time (~48 minutes) than unplanned (~93 minutes).
- Prophet Modeling: Used to forecast maintenance times, focusing on reducing unplanned downtime by shifting jobs to planned schedules.
- Streamlit App: Built an app to visualize maintenance forecasts, later transitioned to a Power BI dashboard for monthly metrics.
- Key Insight: Planned maintenance is more efficient, leading to significant time savings and reduced downtime.

<img src="images/swire_streamlit_app.png?raw=true"/>

---
<p style="font-size:11px">Page template forked from <a href="https://github.com/evanca/quick-portfolio">evanca</a></p>
<!-- Remove above link if you don't want to attibute -->

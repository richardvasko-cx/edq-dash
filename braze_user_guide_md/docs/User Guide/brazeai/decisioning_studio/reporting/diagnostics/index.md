# Diagnostics report

> The diagnostics report contains two different report types: **Outbound** and **Inbound**.



The outbound diagnostics report shows the daily volume of recommendations generated and activated across your audiences. Use it to spot delivery issues, track spikes or drops in activations, and confirm that messages are reaching the right groups as expected.

![Outbound diagnostics report showing a line chart tracking the daily volume of recommendations generated and activated for different audience groups. The chart displays two lines labeled Generated and Activated, with the y-axis representing the number of recommendations and the x-axis showing dates. A legend identifies each line by color. The interface includes dropdown filters for date range and audience selection above the chart.](https://www.braze.com/docs/assets/img/decisioning_studio/reporting_diagnostics_outbound.png?82c731d08f875c6af3d4e1925cbb5cdd)





The inbound diagnostics report monitors the health of your data feeds into BrazeAI™. It tracks details like file counts, sizes, and row volumes for each asset, helping you confirm that data is flowing in as expected and troubleshoot issues before they affect your agents or campaigns.

You can use the dropdown to select different chart metrics, like average file size or file count.

![Inbound diagnostics report showing a line chart tracking the daily file count and average file size for data assets delivered to BrazeAI™. The chart displays two lines labeled File count and Average file size MBs with the y-axis representing values and the x-axis showing dates. Above the chart are dropdown filters for date range and data asset selection.]( /docs/assets/img/decisioning_studio/reporting_diagnostics_inbound.png?1af665c7844ac8eb11c0b32dff3270ec )

Refer to the following table for more details about each metric in the inbound report:

| Field | Description |
|-------|-------------|
| Data asset | The name of the dataset or file delivered. |
| Date | The date when the data was received. |
| Last delivery time | The most recent time the data was delivered. |
| File count | The total number of files received. |
| Max file size (MBs) | The size of the largest file received, in megabytes. |
| Average file size (MBs) | The average size of all files received, in megabytes. |
| File row count | The total number of rows contained in the delivered files. |
{: .reset-td-br-1 .reset-td-br-2 aria-label="Diagnostics report" }




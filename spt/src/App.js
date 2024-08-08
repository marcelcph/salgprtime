import { useState } from "react";
import emailjs from "emailjs-com";
import "./App.css";
import "./index.css";

function App() {
  const [rows, setRows] = useState([
    {
      name: "",
      hours: "",
      sales: {
        fastEl: "",
        timeEl: "",
        fastSpar400: "",
        timeSpar400: "",
        elSpar: "",
        gasSpar: "",
        gas: ""
      },
      status: "Ingen"
    }
  ]);
  const [results, setResults] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [averageSales, setAverageSales] = useState(0);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [office, setOffice] = useState("Glostrup");
  const [weekGoal, setWeekGoal] = useState("");
  const [goal, setGoal] = useState("");

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        name: "",
        hours: "",
        sales: {
          fastEl: "",
          timeEl: "",
          fastSpar400: "",
          timeSpar400: "",
          elSpar: "",
          gasSpar: "",
          gas: ""
        },
        status: "Ingen"
      }
    ]);
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    if (field in newRows[index].sales) {
      newRows[index].sales[field] = value;
    } else {
      newRows[index][field] = value;
    }
    setRows(newRows);
  };

  const handleStatusChange = (index, value) => {
    const newRows = [...rows];
    newRows[index].status = value;
    if (value === "Syg" || value === "Udeblevet") {
      newRows[index].hours = "0";
    }
    setRows(newRows);
  };

  const handleCalculate = () => {
    let totalHours = 0;
    let totalSales = 0;

    const newResults = rows.map((row) => {
      const hours = parseFloat(row.hours) || 0;
      const sales = Object.values(row.sales).reduce(
        (sum, sale) => sum + (parseFloat(sale) || 0),
        0
      );

      totalHours += hours;
      totalSales += sales;

      const averageSales = hours > 0 ? (sales / hours).toFixed(2) : 0;
      const salesWithDefault = Object.fromEntries(
        Object.entries(row.sales).map(([key, value]) => [key, value || "0"])
      );

      return {
        name: row.name || "0",
        hours: row.hours || "0",
        sales: salesWithDefault,
        totalSales: sales,
        averageSales,
        status: row.status
      };
    });

    newResults.sort((a, b) => b.totalSales - a.totalSales);

    setResults(newResults);
    setTotalHours(totalHours);
    setTotalSales(totalSales);
    setAverageSales(totalHours > 0 ? (totalSales / totalHours).toFixed(2) : 0);
  };

  const generateResultsTable = () => {
    return `
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Navn</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Syg/Udeblevet</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Salg</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Timer</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Gennemsnitlige Salg pr. Time</th>
        </tr>
        ${results
          .map(
            (result) => `
              <tr>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${result.name}</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${result.status}</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">
                  ${Object.values(result.sales).join(" / ")}
                </td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${result.hours}</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${result.averageSales}</td>
              </tr>
            `
          )
          .join("")}
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><strong>Total</strong></td>
          <td></td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><strong>${totalSales}</strong></td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><strong>${totalHours}</strong></td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><strong>${averageSales}</strong></td>
        </tr>
      </table>
    `;
  };

  const generateClipboardText = () => {
    const totals = results.reduce(
      (acc, result) => {
        Object.entries(result.sales).forEach(([key, value]) => {
          acc[key] += parseInt(value) || 0;
        });
        return acc;
      },
      {
        fastEl: 0,
        timeEl: 0,
        fastSpar400: 0,
        timeSpar400: 0,
        elSpar: 0,
        gasSpar: 0,
        gas: 0
      }
    );

    const totalSales = Object.values(totals).reduce((sum, sale) => sum + sale, 0);

    const sortedResults = [...results].sort((a, b) => {
      if (a.status === "Ingen" && b.status !== "Ingen") return -1;
      if (a.status !== "Ingen" && b.status === "Ingen") return 1;
      if (a.status === "Syg" && b.status !== "Syg") return -1;
      if (a.status !== "Syg" && b.status === "Syg") return 1;
      return 0;
    });

    const resultsText = sortedResults
      .map((result) => {
        const salesValues = Object.values(result.sales).join("/");
        if (result.status === "Syg" && salesValues === "0/0/0/0/0/0/0") {
          return `${result.name}: Syg`;
        } else if (result.status === "Syg") {
          return `${result.name} (Syg): ${salesValues}`;
        } else if (result.status === "Udeblevet") {
          return `${result.name}: Udeblevet`;
        } else {
          return `${result.name}: ${salesValues}`;
        }
      })
      .join("\n");

    return `**Status ${office} d. ${new Date().toLocaleDateString('da-DK')}**

Fast-EL/Time-EL/Fast-Spar400/Time-Spar400/EL-Spar/Gas-Spar/Gas:

${resultsText}

I alt: ${Object.values(totals).join("/")} = ${totalSales} stk.

Ugemål: ${weekGoal}/${goal}
    `;
  };

  const handleCopyToClipboard = () => {
    const textToCopy = generateClipboardText();
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setMessage("Salgstal blev kopieret til udklipsholder!");
      },
      (err) => {
        setMessage("Kunne ikke kopiere salgstal til udklipsholder.");
        console.error("Failed to copy text: ", err);
      }
    );
  };

  const handleSendEmail = () => {
    setLoading(true);
    const resultsTable = generateResultsTable();
    const templateParams = {
      to_email: email,
      resultsTable: resultsTable
    };

    emailjs
      .send(
        "service_50a3msq",
        "template_g9wpo9t",
        templateParams,
        "eevvcmFvgav4jlpEo"
      )
      .then(
        (response) => {
          setLoading(false);
          setMessage("E-mailen blev sendt succesfuldt!");
          console.log("SUCCESS!", response.status, response.text);
        },
        (error) => {
          setLoading(false);
          setMessage("Fejl ved afsendelse af e-mailen. Prøv igen.");
          console.log("FAILED...", error);
        }
      );
  };

  return (
    <div className="container">
      <h1>Salgstal - CM Relation</h1>
      <div className="radio-buttons">
        <h2>Vælg kontor:</h2>
        <input
          type="radio"
          id="kobenhavn"
          value="København"
          checked={office === "København"}
          onChange={(e) => setOffice(e.target.value)}
        />
        <label htmlFor="kobenhavn">København</label>
        <input
          type="radio"
          id="glostrup"
          value="Glostrup"
          checked={office === "Glostrup"}
          onChange={(e) => setOffice(e.target.value)}
        />
        <label htmlFor="glostrup">Glostrup</label>
      </div>

      <table className="input-table">
        <thead>
          <tr>
            <th>Navn</th>
            <th>Timer</th>
            <th>Fast-EL</th>
            <th>Time-EL</th>
            <th>Fast-Spar400</th>
            <th>Time-Spar400</th>
            <th>EL-spar</th>
            <th>Gas-spar</th>
            <th>Gas</th>
            <th>Syg/Udeblevet</th>
            <th>Handling</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="highlight">
                <input
                  type="text"
                  className="name-input"
                  value={row.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  placeholder="Navn"
                />
              </td>
              <td className="highlight">
                <input
                  type="number"
                  className="hours-input"
                  value={row.hours}
                  onChange={(e) => handleChange(index, "hours", e.target.value)}
                  placeholder="Timer"
                  disabled={row.status !== "Ingen"}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.sales.fastEl}
                  onChange={(e) => handleChange(index, "fastEl", e.target.value)}
                  placeholder="Fast-EL"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.sales.timeEl}
                  onChange={(e) => handleChange(index, "timeEl", e.target.value)}
                  placeholder="Time-EL"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.sales.fastSpar400}
                  onChange={(e) =>
                    handleChange(index, "fastSpar400", e.target.value)
                  }
                  placeholder="Fast-Spar400"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.sales.timeSpar400}
                  onChange={(e) =>
                    handleChange(index, "timeSpar400", e.target.value)
                  }
                  placeholder="Time-Spar400"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.sales.elSpar}
                  onChange={(e) => handleChange(index, "elSpar", e.target.value)}
                  placeholder="EL-spar"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.sales.gasSpar}
                  onChange={(e) =>
                    handleChange(index, "gasSpar", e.target.value)
                  }
                  placeholder="Gas-spar"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.sales.gas}
                  onChange={(e) => handleChange(index, "gas", e.target.value)}
                  placeholder="Gas"
                />
              </td>
              <td className="highlight">
                <select
                  value={row.status}
                  onChange={(e) => handleStatusChange(index, e.target.value)}
                >
                  <option value="Ingen"></option>
                  <option value="Syg">Syg</option>
                  <option value="Udeblevet">Udeblevet</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleDeleteRow(index)}>Slet</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddRow}>Tilføj række</button>
      <h2>Ugemål:</h2>

      <div className="goal-input-container">
        <div className="goal-input">
          <input
            type="text"
            value={weekGoal}
            onChange={(e) => setWeekGoal(e.target.value)}
            placeholder="Salg på ugen"
          />
          <span>/</span>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ugemål"
          />
        </div>
      </div>
      <br /><br />
      <button className="sendmail" onClick={handleCalculate}>Få salgstal</button>

      {results.length > 0 && (
        <>
          <table className="results-table">
            <thead>
              <tr>
                <th>Navn</th>
                <th>Syg/Udeblevet</th>
                <th>Salg</th>
                <th>Timer</th>
                <th>Gennemsnitlige Salg pr. Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.name}</td>
                  <td>{result.status}</td>
                  <td>{Object.values(result.sales).join(" / ")}</td>
                  <td>{result.hours}</td>
                  <td>{result.averageSales}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total</strong></td>
                <td></td>
                <td><strong>{totalSales}</strong></td>
                <td><strong>{totalHours}</strong></td>
                <td><strong>{averageSales}</strong></td>
              </tr>
            </tbody>
          </table>
          <br />
          <button
            className="sendmail"
            onClick={handleSendEmail}
            disabled={loading}
          >
            {loading ? "Sender..." : "Send Resultater via E-mail"}
          </button><br></br>
          <button onClick={handleCopyToClipboard}>Kopier til udklipsholder</button>
        </>
      )}
      {message && <p className={`message ${message.includes('succesfuldt') ? 'success' : 'error'}`}>{message}</p>}
    </div>
  );
}

export default App;

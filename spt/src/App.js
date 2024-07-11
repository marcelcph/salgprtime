import { useState } from "react";
import emailjs from "emailjs-com";
import "./App.css";
import "./index.css";

function App() {
  const [rows, setRows] = useState([{ name: "", hours: "", sales: "" }]);
  const [results, setResults] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddRow = () => {
    setRows([...rows, { name: "", hours: "", sales: "" }]);
  };

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleCalculate = () => {
    const newResults = rows.map((row) => {
      const hours = parseFloat(row.hours);
      const sales = parseFloat(row.sales);
      const averageSales = hours > 0 ? (sales / hours).toFixed(2) : 0;
      return {
        name: row.name,
        hours: row.hours,
        sales: row.sales,
        averageSales,
      };
    });
    setResults(newResults);
  };

  const generateResultsTable = () => {
    return `
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Navn</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Timer</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Antal Salg</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Gennemsnitlige Salg pr. Time</th>
        </tr>
        ${results
          .map(
            (result) => `
              <tr>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${result.name}</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${result.hours}</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${result.sales}</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${result.averageSales}</td>
              </tr>
            `
          )
          .join("")}
      </table>
    `;
  };

  const handleSendEmail = () => {
    setLoading(true);
    const resultsTable = generateResultsTable();
    const templateParams = {
      to_email: email,
      resultsTable: resultsTable,
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
      <h1>Salg pr. Time Beregner</h1>
      <table className="input-table">
        <thead>
          <tr>
            <th>Navn</th>
            <th>Timer</th>
            <th>Salg</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  placeholder="Navn"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.hours}
                  onChange={(e) => handleChange(index, "hours", e.target.value)}
                  placeholder="Timer"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.sales}
                  onChange={(e) => handleChange(index, "sales", e.target.value)}
                  placeholder="Salg"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddRow}>Tilføj række</button>
      <br />
      <button onClick={handleCalculate}>Udregn SPT</button>

      {results.length > 0 && (
        <>
          <table className="results-table">
            <thead>
              <tr>
                <th>Navn</th>
                <th>Timer</th>
                <th>Antal Salg</th>
                <th>Gennemsnitlige Salg pr. Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.name}</td>
                  <td>{result.hours}</td>
                  <td>{result.sales}</td>
                  <td>{result.averageSales}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <button
            className="sendmail"
            onClick={handleSendEmail}
            disabled={loading}
          >
            {loading ? "Sender..." : "Send Resultater via E-mail"}
          </button>
        </>
      )}
      {message && <p className={`message ${message.includes('succesfuldt') ? 'success' : 'error'}`}>{message}</p>}
    </div>
  );
}

export default App;

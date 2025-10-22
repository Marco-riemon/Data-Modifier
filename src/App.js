import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { useTable } from 'react-table';
import './App.css';

function App() {
  const [jsonData, setJsonData] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [transformedData, setTransformedData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setJsonData(data);
      } catch (error) {
        alert("Error parsing JSON file.");
      }
    };

    reader.readAsText(file);
  };

  const handlePropertySelection = (selectedOptions) => {
    setSelectedProperties(selectedOptions);
  };

  const handleTransform = () => {
    if (!jsonData || jsonData.length === 0) {
      alert("Please upload a JSON file first.");
      return;
    }

    if (!selectedProperties || selectedProperties.length === 0) {
      alert("Please select at least one property.");
      return;
    }

    const transformed = {};
    selectedProperties.forEach(prop => {
      transformed[prop.value] = {
        "$in": jsonData.map(item => item[prop.value])
      };
    });
    const finalTransformed = { user_id: transformed };
    setTransformedData([finalTransformed]);
  };


 const handleDownload = () => {
    const dataStr = JSON.stringify(transformedData[0], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'data.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const columns = useMemo(() => {
    if (transformedData.length > 0) {
      const keys = Object.keys(transformedData[0]);
      return keys.map(key => ({
        Header: key,
        accessor: key,
        Cell: ({ value }) => JSON.stringify(value, null, 2),
      }));
    } else {
      return [];
    }
  }, [transformedData]);


  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data: transformedData,
  });

  const propertyOptions = useMemo(() => {
    if (jsonData.length > 0) {
      const firstItemKeys = Object.keys(jsonData[0]);
      return firstItemKeys.map(key => ({
        value: key,
        label: key,
      }));
    } else {
      return [];
    }
  }, [jsonData]);

  return (
    <div className="App">
      <h1>MongoDB Query Modifier</h1>
      <label htmlFor="file-upload" className="custom-file-upload">
        Choose file
      </label>
      <input id="file-upload" type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }}/>
      <Select
        isMulti
        options={propertyOptions}
        onChange={handlePropertySelection}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
      />
      <button onClick={handleTransform} disabled={!jsonData || jsonData.length === 0 || !selectedProperties || selectedProperties.length === 0}>Transform</button>
      <button onClick={handleDownload} disabled={!transformedData || transformedData.length === 0}>Download JSON</button>

      <table {...getTableProps()} style={{ border: 'solid 1px blue', width: '100%' }}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps()}
                  style={{
                    borderBottom: 'solid 3px red',
                    background: 'aliceblue',
                    color: 'black',
                    fontWeight: 'bold',
                    padding: '8px',
                  }}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        padding: '8px',
                        border: 'solid 1px gray',
                        background: 'papayawhip',
                        textAlign: 'left',
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;

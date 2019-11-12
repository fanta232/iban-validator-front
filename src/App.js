import React, { Component } from 'react';
import axios from 'axios';
import { save } from 'save-file';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    // bind functions to the class:
    this.onChangeIBAN = this.onChangeIBAN.bind(this);
    this.onSubmitSingleIban = this.onSubmitSingleIban.bind(this);
    this.onChangeFile = this.onChangeFile.bind(this);
    this.onSubmitFile = this.onSubmitFile.bind(this);

    this.state = {
      iban: "", // input iban string
      dataFile: null, // input iban text file
      fileName: "", // name of the input file
      response: null // response from the server containing the iban string and validation result
    }
  }

  onChangeIBAN(e) {
    // handle iban input form change:
    this.setState({ iban: e.target.value });
  }

  onChangeFile(e) {
    // handle iban text file change:
    this.setState({ dataFile: e.target.files[0] });
    const fileName = e.target.files[0].name.split('.')[0];
    this.setState({ fileName: fileName })
  }

  onSubmitFile(e) {
    e.preventDefault();
    // if there is no file received - exit:
    if (!this.state.dataFile) return;

    // open a new file reader to parse the received text file as a base64 blob:
    const reader = new FileReader();
    reader.addEventListener("load" , () => {
      // prepare data to be sent to the api:
      const data = {file: reader.result}

      // post data to the api:
      axios.post('http://localhost:3000/api/validateFile/', data)
      .then(async (res) => {
        // if response is empty throw an error:
        if (res === null || res === undefined) throw new Error("received empty response");
        // parse response data:
        const result = res.data;
        // prompt the user to save it as a file with a .out extension:
        await save(result, `${this.state.fileName + ".out"}`);
      })
      .catch((err) => { // handle any errors
        console.error(err);
        // show an alert if an error has occurred:
        alert(err);
      });
    });
    reader.readAsDataURL(this.state.dataFile);
  }

  onSubmitSingleIban(e) {
    e.preventDefault();
    // if iban string is empty - exit:
    if(this.state.iban === "") return;

    // get data from the api:
    axios.get('http://localhost:3000/api/validateSingle/', {
      params: {
        ibanCode : this.state.iban // include the iban string as a parameter to be sent
      }
    })
    .then((res) => {
      // if response is empty throw an error:
      if (res === null || res === undefined) throw new Error("received empty response");
      // update state with response data:
      this.setState({ response: res.data });
    })
    .catch((err) => { // handle any errors
      console.error(err);
      // show an alert if an error has occurred:
      alert(err);
    });
  }

  render() {
    return (
      <div className="container">

        <section className="row justify-content-center text-center">
          <header className="col-11 my-4">
            <h2>IBAN Validator</h2>
          </header>
        </section>
        
        <section className="row justify-content-center text-center">
          <form className="col-11 col-md-5">
            <div className="form-group">
              <input type="text" className="form-control" placeholder="Enter IBAN to validate" value={this.state.iban} onChange={this.onChangeIBAN} />
              <button type="button" className="btn btn-dark mt-2" onClick={this.onSubmitSingleIban}>Submit IBAN</button>
            </div>
          </form>

          { this.state.response &&
            <div className="col-11 col-md-11">
              {this.state.response.result && <p className="my-3" style={{color:"green"}}><b>{this.state.response.iban} is a valid IBAN</b></p>}
              {!this.state.response.result && <p className="my-3" style={{color:"red"}}><b>{this.state.response.iban} is an invalid IBAN</b></p>}
            </div>
          }

          <b className="col-11 col-md-11 my-4">Or upload a text file of IBANs</b>

          <form className="col-11 col-md-5" >
            <div className="form-group">
              <input type="file" accept=".txt" className="form-control-file center" onChange={this.onChangeFile} onClick={e => (e.target.value = null)}/>
              <button type="button" onClick={this.onSubmitFile} className="btn btn-dark mt-2">Submit File</button>
            </div>
          </form>
        </section>

      </div>
    );
  }
}

export default App;
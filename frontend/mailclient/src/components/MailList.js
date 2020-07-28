import React from "react";
import MailItem from "./MailItem";
import ReactHtmlParser from "react-html-parser";
import { Spinner } from "reactstrap";
import {
  SHOW_EMAILS,
  MAIL_DETAILS_URL,
  MARK_AS_READ_URL,
} from "../data/Constants";
import { getRequestOptions } from "../data/Helper";

export default class MailList extends React.Component {
  state = {
    modal: false,
    toggle: false,
    timerId: null,
    data: [],
    dataloading: false,
    seq: null,
    fromSource: "",
    subject: "",
    showDetails: false,
    seen: false,
  };

  showMailsContentRequest = async(seq) => {
    const requestOptions = await getRequestOptions();
    fetch(`${MAIL_DETAILS_URL}${seq}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        this.setState(
          {
            content: result.data.mailContent || [],
            dataloading: false,
            showDetails: true,
            seq,
          },
          () => this.checkTimeout()
        );
      })
      .catch(
        (error) => console.log("error", error),
        () => this.setState({ dataloading: false })
      );
  };
  markAsReadRequest = async (seq) => {
    const requestOptions = await getRequestOptions();
    fetch(`${MARK_AS_READ_URL}${seq}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        this.clearTimeerAndResetState();
      })
      .catch((error) => console.log("error", error));
  };

  showMailsRequest = async () => {
    this.setState({ dataloading: true });
    const requestOptions = await getRequestOptions();
    fetch(SHOW_EMAILS, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        this.setState({ data: result.data || [], dataloading: false }, () =>
          console.log("Data loaded")
        );
      })
      .catch((error) => console.log("error", error));
  };

  checkTimeout = () => {
    const timerId = setTimeout(() => {
      if (this.state.seq && !this.state.seen) {
        this.markAsReadRequest(this.state.seq);
        this.setState({ timerId: null, seq: null });
      }
    }, 3000);
    this.setState({ timerId });
  };
  onItemClick = async (e) => {
    this.setState({
      dataloading: true,
      subject: e.subject,
      fromSource: e.from,
      seq: e.seq,
      seen: e.seen,
    });
    if (e.seq) this.showMailsContentRequest(e.seq);
  };
  clearTimeerAndResetState = () => {
    if (this.state.timerId) {
      clearTimeout(this.state.timerId);
      this.setState({ timerId: null }, () => this.showMailsRequest());
      return;
    }
  };
  componentDidMount() {
    this.showMailsRequest();
  }

  handleBack = async () => {
    // this.props.history.push("/list")
    this.showMailsRequest();
    this.setState(
      { content: null, fromSource: "", subject: "", showDetails: false },
      () => this.clearTimeerAndResetState()
    );
  };
  render() {
    return (
      <div className="mail-container">
        {this.state.dataloading ? (
          <Spinner role="status" />
        ) : this.state.showDetails ? (
          <div className="details-container">
            <button onClick={this.handleBack}>Back</button>
            <div className="details-header">
              <h4> From : {this.state.fromSource}</h4>
              <h4> Subject : {this.state.subject}</h4>
            </div>
            <div className="details-mail-content">
              <p>
                {this.state.content ? ReactHtmlParser(this.state.content) : ""}
              </p>
            </div>
          </div>
        ) : (
          (this.state.data &&
            this.state.data.map((e) => (
              <MailItem
                key={e.seq}
                row={e}
                onClick={() => this.onItemClick(e)}
              />
            ))) || <h4>No new emails</h4>
        )}
      </div>
    );
  }
}

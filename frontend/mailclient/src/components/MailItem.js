import React from 'react';



class MailItem extends React.Component {

  state = {
  }
  openModel =  (item) => {
    
  }
  render() {
    return (
      <div className="mail-row" onClick={e =>this.props.onClick(this.props.row.seq)}>
        <h4>{this.props.row.from}</h4>
        <h5>{this.props.row.seen ? "Read": "Unread"}</h5>
        <p>{this.props.row.subject}</p>

      </div>
    );
  }
}

export default MailItem;
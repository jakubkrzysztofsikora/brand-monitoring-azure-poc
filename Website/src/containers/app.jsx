import React from 'react';
import ReactDOM from "react-dom";
import moment from 'moment';

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = { mentions: [] };
	}
	componentDidMount() {
		fetch('https://series.search.windows.net/indexes/documentdb-index/docs?api-version=2016-09-01&search=*&%24orderby=date%20desc', { headers: {'api-key': '9026A2591764CA51A51D8B2B3F3454B0'}})
			.then(response => response.json())
			.then(results => this.setState({ mentions: results.value }));
	}

    render(){
        return (
            <div className="app-container">
				<div>
					<h1>Simple Twitter Brand Monitoring</h1>
					<div className='items'>{this.state.mentions.map((mention, index) => {
						return <div className='item' key={index}>
							<p className={`sentiment ${mention.sentiment > 0.6 ? 'positive': mention.sentiment < 0.4 ? 'negative' : 'neutral' }`}>
								{mention.sentiment > 0.6 ? 'Postive' : mention.sentiment < 0.4 ? 'Negative' : 'Neutral'}
							</p>
							<p className='author'><a href={`https://twitter.com/${mention.author}`} target='_blank'>{mention.author}</a> <span>(Potential reach: {mention.reach})</span></p>
							<p className='date' title={moment(mention.date).format('DD-MM-YYYY HH:mm')}>{moment(mention.date).fromNow()}</p>
							<p className='text'>{mention.text}</p>
							<a className='link' href={`https://twitter.com/${mention.author}/status/${mention.id}`} target='_blank'>Go to tweet</a>
						</div>;
					})}
					</div>
				 </div>
            </div>
        );
    }
}
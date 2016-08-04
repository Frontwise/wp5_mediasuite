import CollectionSelector from './CollectionSelector';
import FacetSearchComponent from './FacetSearchComponent';
import AnnotationBox from './annotation/AnnotationBox';
import FlexBox from './FlexBox';

class ComparativeSearch extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			user : this.props.user,
			collections : this.props.collections,
			activeCollection: this.props.collections.length > 0 ? this.props.collections[0] : null,
			currentOutput: null, //could also be a default state value for components which implement onOutput
			showAnnotationModal : false, //only if there is annotationSupport and only for classify, comment & link
			annotationTarget : null //only if there is annotationSupport and only for classify, comment & link
		}
	}

	/* ------------------------ COLLECTION CRUD --------------------- */

	removeCollection(collectionId) {
		let cs = this.state.collections;
		let index = cs.indexOf(collectionId);
		if(index != -1) {
			cs.splice(index, 1);
			this.setState({
				collections : cs,
				activeCollection : cs.length > 0 ? cs[0] : null
			});
		}
	}

	//TODO this function should never load a collection that has been already loaded
	onEditCollections(collectionId) {
		let cs = this.state.collections;
		if(cs.indexOf(collectionId) == -1) {
			cs.push(collectionId);
			this.setState({
				collections : cs,
				activeCollection : collectionId
			});
		}
	}

	/* ---------------------- (FUTURE) DEFAULT COMPONENT FUNCTIONS ------------------- */

	//this function should be standard for any component that outputs data to the recipe
	onOutput(componentType, data) {
		if(this.props.onOutput) {
			this.props.onOutput(componentType, data);
		}
		this.setState({currentOutput: data});
	}

	/* ----------------------- FOR ANNOTATION SUPPORT (candidates for utility or super class)----- */

	//this function should check if the annotation support is relevant for itself
	hasAnnotationSupport() {
		if(this.props.annotationSupport != null) {
			if(this.props.annotationSupport.currentQuery || this.props.annotationSupport.singleItem) {
				return true;
			}
		}
		return false;
	}

	//TODO implement for real
	addAnnotation(type) {
		let annotationTarget = 'test ' + type;
		this.setState({
			showAnnotationModal: true,
			annotationTarget: annotationTarget
		});
	}

	bookmark(type) {
		console.debug('bookmarking:  '+ type);
		console.debug(this.props.annotationSupport[type]);
		if(this.props.annotationSupport[type].modes.indexOf('bookmark') != -1) {
			if(type == 'currentQuery' && this.state.currentOutput != null) {
				console.debug('bookmarked this query:');
				console.debug(this.state.currentOutput.results.query);
			}
		}
	}

	handleShowModal() {
		this.setState({showAnnotationModal: true})
	}

	handleHideModal() {
		this.setState({showAnnotationModal: false})
	}

	/* ---------------------- RENDER ------------------- */

	render() {
		var collectionSelector = null;
		let annotationBox = null; // in case there is annotation support configured
		let annotationTestButtons = null;
		//for drawing the tabs
		var searchTabs = this.state.collections.map(function(c) {
			return (
				<li key={c + '__tab_option'}
					className={this.state.activeCollection == c ? 'active' : ''}>
					<a data-toggle="tab" href={'#' + c}>
						{c}
						<i className="glyphicon glyphicon-minus" onClick={this.removeCollection.bind(this, c)}></i>
					</a>
				</li>)
		}, this)

		//these are the facet search UI blocks put into different tabs
		var searchTabContents = this.state.collections.map(function(c) {
			return (
				<div key={c + '__tab_content'}
					id={c}
					className={this.state.activeCollection == c ? 'tab-pane active' : 'tab-pane'}>
					<h3>{c}</h3>
					<FacetSearchComponent key={c + '__sk'}
						collection={c}
						searchAPI={_config.SEARCH_API_BASE}
						onOutput={this.onOutput.bind(this)}/>
				</div>
				);
		}, this);

		//only show if configured
		if(this.props.collectionSelector === true) {
			collectionSelector = <FlexBox><CollectionSelector onEditCollections={this.onEditCollections.bind(this)}/></FlexBox>;
		}

		//only show if configured
		if(this.hasAnnotationSupport()) {
			annotationBox = (
				<AnnotationBox user={this.state.user}
					showList={false}
					annotationModes={this.props.annotationModes}
					showModal={this.state.showAnnotationModal}
					annotationTarget={this.state.annotationTarget}
					handleHideModal={this.handleHideModal.bind(this)}
					handleShowModal={this.handleShowModal.bind(this)}/>
			)
			annotationTestButtons = (
				<div>
					<button type="button" className="btn btn-default"
						onClick={this.bookmark.bind(this, 'currentQuery')}>
						Bookmark current query
					</button>
					&nbsp;
					<button type="button" className="btn btn-default"
						onClick={this.addAnnotation.bind(this, 'singleItem')}>
						Annotate test
					</button>
					<br/>
					<br/>
				</div>
			)
		}

		return (
			<div>
				{collectionSelector}
				<div className="row">
					<div className="col-md-12">
						<FlexBox>
							{annotationTestButtons}
							<ul className="nav nav-tabs">
								{searchTabs}
							</ul>
							<div className="tab-content">
								{searchTabContents}
							</div>
						</FlexBox>
					</div>
					{annotationBox}
				</div>
			</div>
		)
	}
}

export default ComparativeSearch;
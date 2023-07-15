import React, {Component} from 'react';
import {fetchTree} from '../../../Service/Utils/dataWrapper/dataWrapper';
import {
  fetchOpenReport,
  fetchOpenCohort,
} from '../../../Service/Utils/commonWrapper/commonWrapper';
import {
  capitalizeFirstLetter,
  designSelectedItemPayload,
  getTenantIDGUID,
  cohortDefinitionWrapper,
} from '../../../utils/utils';
import {PageHeader} from '@carbon/ibm-products';
import {Grid, Row, Column} from 'carbon-components-react';
import {IconButtonComponent} from '../../../Component/IconButton/IconButton';
import {LeftPane} from '../../Pane/_LeftPane/LeftPane';
import {RightPane} from '../../Pane/_RightPane/RightPane';
import {MainDropDownContainer} from '../../DropDownContainer/DropDownContainer/DropDownContainer';
// import { SubsetEditor } from "../../../../components/editors/subset/SubsetEditor";
import {Subset} from '../../../Container/Subset/Subset';
// import {ModalComponent} from '../../../Component/Modal/ModalComponent'
import {
  report_Name,
  leftTreeTab,
  topButton,
  tabName,
  tabIndex,
  leftTree,
  bottomHeaderBtn,
  topHeaderIconIndex,
} from '../../../Constants/constants';
import './_mainPage-container.scss';
import './mainPage-container.css';
import NewTab from '../../../Icons/filter row/ahrw_new-tab.svg';
import Open from '../../../Icons/filter row/folder--open.svg';
import Save from '../../../Icons/filter row/save.svg';
import SelectedDimension from '../../../Icons/nav pane/ahrw_SelectedDimension.svg';
import CohortTab from '../../../Icons/filter row/ahrw_subsets.svg';
import ArrowsTab from '../../../Icons/filter row/ahrw_arrows--vertical.png';
import {connect} from 'react-redux';

class MainPageContainerRender extends Component {
  state = {
    hideLeftPane: false,
    selectedTab: leftTree.DIMENSION,
  };
  handleTreeChange = value => {
    const {treeChange} = this.props;

    treeChange(value);
  };
  runClick = value => {
    this.setState({hideLeftPane: value});
  };
  selectedTabChange = tabValue => {
    const {treeChange} = this.props;
    this.setState({selectedTab: tabValue});
    treeChange(tabValue);
  };

  render() {
    const {
      selTabIndex,
      updateTabValue,
      reportData,
      treeData,
      treeTab,
      tabIndex,
      treeTabIndexChange,
      updateLeafNodetreeData,
      leafNodeTreeData,
      searchBtnClicked,
      updateSearchButton,
      iconClicks,
    } = this.props;
    const {hideLeftPane} = this.state;
    return (
      <Grid className="sample-page__dummy-content" narrow={true}>
        <Row>
          {
            <Column
              lg={5}
              className="sample-page__dummy-content-block minHeight"
              style={{display: hideLeftPane ? 'none' : ''}}>
              <LeftPane
                handleTreeChange={this.handleTreeChange}
                treeData={treeData[treeTab]}
                searchTreeData={treeData}
                selectedTab={this.state.selectedTab}
                onSelectedTabChange={this.selectedTabChange}
                treeTabIndexChange={treeTabIndexChange}
                tabIndex={tabIndex}
                updateLeafNodetreeData={updateLeafNodetreeData}
                searchBtnClicked={searchBtnClicked}
                updateSearchButton={updateSearchButton}
                iconClicks={iconClicks}
              />
            </Column>
          }
          <Column
            lg={11}
            className="sample-page__dummy-content-block minHeight">
            <RightPane
              treeData={treeData[treeTab]}
              selectedTreeTab={treeTab}
              runClick={this.runClick}
              selTabIndex={selTabIndex}
              updateTabValue={updateTabValue}
              reportData={reportData}
              selectedTab={this.state.selectedTab}
              leafNodeTreeData={leafNodeTreeData}
            />
          </Column>
        </Row>
      </Grid>
    );
  }
}

export class MainPageContainer extends React.Component {
  state = {
    selTabIndex: tabIndex.DESIGNINDEX,
    selSection: [],
    selRow: [],
    selColumn: [],
    reportName: report_Name,
    existingReportData: {},
    existingReportFlag: false,
    openSubset: false,
    subsetData: {},
    existingSubset: false,
    treeData: {
      dimension: [],
      measure: [],
      subset: [],
      timeperiod: [],
    },
    leafNodeTreeData: {
      dimension: [],
      measure: [],
      subset: [],
      timeperiod: [],
    },
    treeTab: leftTree.DIMENSION,
    tabIndex: 0,
    searchBtnClicked: false,
  };

  componentDidMount() {
    this.openReport();
    this.tree(leftTree.DIMENSION);
    this.tree(leftTree.MEASURE);
    this.tree(leftTree.SUBSET);
    this.tree(leftTree.TIMEPERIOD);
  }

  openReport = async () => {
    const guid = getTenantIDGUID().guid;
    if (guid) {
      const data = await fetchOpenReport(guid);
      if (data && data.name) {
        this.setState({
          reportName: data.name,
          existingReportData: data,
          existingReportFlag: true,
        });
      }
    }
  };

  tree = async tabName => {
    const treeTabName =
      tabName === leftTree.TIMEPERIOD ? leftTree.TIMEPERIOD : tabName; //Time Period Object of array
    const data = await fetchTree(treeTabName);
    this.setState(prevState => {
      const obj = {...prevState};
      obj.treeData[treeTabName.toLowerCase()] = data[treeTabName]
        ? data[treeTabName]
        : data; //Time Period Object of array
      return obj;
    });
  };
  treeChange = value => {
    this.setState({treeTab: value});
  };
  treeTabIndexChange = value => {
    this.setState({tabIndex: value});
  };
  updateLeafNodetreeData = value => {
    const treeTabName =
      value.type === leftTree.TIMEPERIOD ? leftTree.TIMEPERIOD : value.type; //Time Period Object of array
    this.setState(prevState => {
      const obj = {...prevState};
      obj.leafNodeTreeData[treeTabName.toLowerCase()] = value.data[treeTabName]
        ? obj.leafNodeTreeData[treeTabName.toLowerCase()].concat(
            value.data[treeTabName],
          )
        : obj.leafNodeTreeData[treeTabName.toLowerCase()].concat(value.data); //Time Period Object of array
      return obj;
    });
  };
  updateSearchButton = value => {
    this.setState({searchBtnClicked: value});
  };
  topHeaderIconClick = selIconIndex => {
    if (
      selIconIndex.index === topHeaderIconIndex.CohortTab &&
      selIconIndex.value &&
      selIconIndex.type === leftTree.SUBSET
    ) {
      this.openCohort(selIconIndex.value);
    } else if (
      selIconIndex.index === topHeaderIconIndex.CohortTab &&
      selIconIndex.type === leftTree.SUBSET
    ) {
      this.setState({
        openSubset: true,
        existingSubset: false,
      });
    }
  };
  topHeaderIcon = (
    <span className="iconCss topIcons">
      <IconButtonComponent
        IconName={NewTab}
        title="New report"
        iconClicks={this.topHeaderIconClick}
      />
      <IconButtonComponent
        IconName={Open}
        title="Open existing report"
        iconClicks={this.topHeaderIconClick}
      />
      <IconButtonComponent
        IconName={Save}
        title="Save current report"
        iconClicks={this.topHeaderIconClick}
      />
      <IconButtonComponent
        IconName={SelectedDimension}
        title="Select values for the selected dimension"
        iconClicks={this.topHeaderIconClick}
      />
      <IconButtonComponent
        IconName={CohortTab}
        title="Create new cohort"
        iconClicks={this.topHeaderIconClick}
        index={topHeaderIconIndex.CohortTab}
      />
      <IconButtonComponent
        IconName={ArrowsTab}
        title="Sort measures"
        iconClicks={this.topHeaderIconClick}
      />
    </span>
  );
  bottomHeaderBtnClick = value => {
    if (value === tabName.RUN) {
      this.setState({selTabIndex: tabIndex.RUNINDEX});
    } else {
      this.setState({selTabIndex: tabIndex.DESIGNINDEX});
    }
  };
  bottomHeaderButtonConfig = [
    {
      key: bottomHeaderBtn.Validate.toLowerCase(),
      kind: 'secondary',
      label: bottomHeaderBtn.Validate,
      className: 'validatebtn',
      onClick: () =>
        this.bottomHeaderBtnClick(bottomHeaderBtn.Validate.toLowerCase()),
    },
    {
      key: bottomHeaderBtn.Run.toLowerCase(),
      label: bottomHeaderBtn.Run,
      className: 'runbtn',
      onClick: () =>
        this.bottomHeaderBtnClick(bottomHeaderBtn.Run.toLowerCase()),
    },
  ];
  updateReportDefinition = (row, column, section) => {
    this.setState({
      selSection: section,
      selRow: row,
      selColumn: column,
    });
  };
  closeSubsetModal = () => {
    this.setState({
      openSubset: false,
    });
  };
  openCohort = async guid => {
    if (guid) {
      const data = await fetchOpenCohort(guid);
      if (data && data.cohortDefinition) {
        let cohortDef = {
          guid: data.guid,
          name: data.name,
          description: data.description,
          cohortDefinition: cohortDefinitionWrapper(data.cohortDefinition),
        };
        if (
          cohortDef.cohortDefinition &&
          cohortDef.cohortDefinition.length > 0
        ) {
          this.setState({
            openSubset: true,
            existingSubset: true,
            subsetData: cohortDef,
          });
        }
      }
    }
  };


  render() {
    const {
      selSection,
      selRow,
      selColumn,
      selTabIndex,
      reportName,
      existingReportData,
      existingReportFlag,
      openSubset,
      subsetData,
      existingSubset,
      treeData,
      treeTab,
      tabIndex,
      leafNodeTreeData,
      searchBtnClicked,
    } = this.state;

    const {rows, columns, sections} = designSelectedItemPayload(
      selRow,
      selColumn,
      selSection,
    );
    {
      console.log(selColumn, 'designSelectedItemPayload rows');
    }
    const rereportDefinitionportDefinition = {
      subsection: sections,
      column: columns,
      row: rows,
    };
    {
      console.log(reportDefinition, 'Main Page Container');
    }
    return (
      <div>
        {openSubset ? (
          <Subset
            onClose={this.closeSubsetModal}
            overlay=""
            treeTab={treeTab}
            treeChange={this.treeChange}
            tree={this.tree}
            treeTabIndexChange={this.treeTabIndexChange}
            treeData={treeData}
            subsetData={subsetData}
            existingSubset={existingSubset}
          />
        ) : (
          ''
        )}
        <PageHeader
          id="topheader"
          title="Ad Hoc Report Writer"
          pageActionsOverflowLabel="Page actions..."
          showAllTagsLabel="Show all tags"
          allTagsModalTitle="Filter tags"
          allTagsModalSearchPlaceholderText="Filter tags"
          allTagsModalSearchLabel="Filter tags"
          actionBarOverflowAriaLabel="more actions"
          breadcrumbOverflowAriaLabel="more breadcrumbs"
          className="dropDownHeader"
          // {...{ breadcrumbs,actionBarItems, pageActions, tags }}
          // {...{ pageActions: this.topButton }}
        >
          <h3>This is Row data{selRow.length}</h3>
          <MainDropDownContainer
            reportDefinition={reportDefinition}
            topHeaderIcon={this.topHeaderIcon}
            isDisabled={openSubset ? true : false}
            existingReportData={existingReportData}
            existingReportFlag={existingReportFlag}
          />
        </PageHeader>

        <main
          message="My content"
          className="sample-page__main minHeight mainCss">
          <PageHeader
            id="bottomHeader"
            className="bottomHeaderCss"
            title={reportName}
            {...{pageActions: this.bottomHeaderButtonConfig}}></PageHeader>

          <MainPageContainerRender
            selTabIndex={selTabIndex}
            updateTabValue={this.bottomHeaderBtnClick}
            report  Data={this.updateReportDefinition}
            treeData={treeData}
            treeChange={this.treeChange}
            treeTab={treeTab}
            treeTabIndexChange={this.treeTabIndexChange}
            tabIndex={tabIndex}
            leafNodeTreeData={leafNodeTreeData}
            updateLeafNodetreeData={this.updateLeafNodetreeData}
            searchBtnClicked={searchBtnClicked}
            updateSearchButton={this.updateSearchButton}
            iconClicks={this.topHeaderIconClick}
          />
        </main>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return state;
};
const mapDispatchToProps = dispatch => {
  return {};
};
export default MainPageContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainPageContainer);

import React, { Component } from "react";
import ClassDataTooltips from "./ClassDataTooltips";
import '../../styles/Major.css';
import '../../styles/LowerDiv.css';

function parseTakenClasses(taken, classes) {
    for (var i = 0; i < classes.length; i++) {
        if (classes[i].courseID in taken) {
            taken[classes[i].courseID] = true;
        }
    }
    return taken;
}

export default class LowerDiv extends Component {
    constructor(props) {
        super(props);
        this.state = {
            classes: [],
            taken: {
                CMPS12A: false,
                CMPS12L: false,
                CMPS5J: false,
                CMPS11: false,
                CMPE13: false,
                CMPE13L: false,
                CMPS12B: false,
                CMPS12M: false,
                CMPS13H: false,
                CMPS13L: false,
                MATH19A: false,
                MATH19B: false,
                MATH20A: false,
                MATH20B: false,
                CMPE16: false,
                MATH23A: false,
                AMS10: false,
                MATH21: false,
                CMPE12: false,
                CMPE12L: false
            },
            classData: {},
            tooltipOpen: false
        };

        this.regularIntroTrackCompleted = this.regularIntroTrackCompleted.bind(this);
        this.introProgrammingCompleted = this.introProgrammingCompleted.bind(this);
        this.dataStructuresCompleted = this.dataStructuresCompleted.bind(this);
        this.calc1Completed = this.calc1Completed.bind(this);
        this.calc2Completed = this.calc2Completed.bind(this);
        this.linearAlgCompleted = this.linearAlgCompleted.bind(this);
        this.mathCompleted = this.mathCompleted.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({ classes: nextProps.classes });
        let taken = this.state.taken;
        taken = parseTakenClasses(taken, nextProps.classes)
        this.setState({ taken: taken });
    }

    componentDidMount() {
        this.makePostForClassData(this.state.taken)
            .then(res => this.setState({ classData: res }))
            .catch(err => console.log(err));
    }

    // Post call to the database to get the user classes
    makePostForClassData = async (classes) => {
        const response = await fetch('/api/getMajorClassData', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ classes: classes })
        });

        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    regularIntroTrackCompleted = () => {
        if (this.state.taken['CMPS12A'] && this.state.taken['CMPS12L']) {
            return true;
        } else if (this.state.taken['CMPS11']) {
            return true;
        } else if (this.state.taken['CMPE13'] && this.state.taken['CMPE13L']) {
            return true;
        }
        return false;
    }

    dataStructuresCompleted = () => {
        return (this.state.taken['CMPS12B'] && this.state.taken['CMPS12M']);
    }

    introProgrammingCompleted() {
        return ((this.dataStructuresCompleted()) || (this.state.taken['CMPS13H'] && this.state.taken['CMPS13L']));
    }

    calc1Completed = () => {
        return (this.state.taken['MATH19A'] || this.state.taken['MATH20A']);
    }

    calc2Completed = () => {
        return (this.state.taken['MATH19B'] || this.state.taken['MATH20B']);
    }

    linearAlgCompleted = () => {
        return (this.state.taken['MATH21'] || this.state.taken['AMS10']);
    }

    mathCompleted = () => {
        return (this.calc1Completed() && this.calc2Completed() && this.linearAlgCompleted() &&
            this.state.taken['CMPE16'] && this.state.taken['MATH23A'])
    }

    toggle() {
        this.setState({ tooltipOpen: !this.state.tooltipOpen });
    }

    render() {
        return (
            <div className="lowerDivs">
                <h3>Lower Division Requirements</h3>
                <b>Intro To Programming</b>
                <hr />
                <div className={this.introProgrammingCompleted() ? 'intro completed' : 'intro'}>
                    <div>
                        <p align="center"><b>Regular Track</b></p>
                        <div className="regularSection" id={this.introProgrammingCompleted() ? 'completedBorder' : ''}>
                            <div className={this.regularIntroTrackCompleted() || this.introProgrammingCompleted() ? 'regular completed' : 'regular uncompleted'}>
                                <div className="cs12a">
                                    <ClassDataTooltips id='cmps12al' text='CMPS12A/L' classData={this.state.classData['CMPS12A']} />
                                    {this.state.taken['CMPS12A'] && this.state.taken['CMPS12L'] && <b>X</b>}
                                </div>
                                <div className="or1">or</div>
                                <div className="cs5j">
                                    <div className={this.state.taken['CMPS5J'] || this.regularIntroTrackCompleted() ||
                                        this.introProgrammingCompleted() ? 'cs5j completed' : 'cs5j uncompleted'}>
                                        <ClassDataTooltips id='cmps5j' text='CMPS5J' classData={this.state.classData['CMPS5J']} />
                                        {this.state.taken['CMPS5J'] && <b>X</b>}
                                    </div>
                                    <div>and</div>
                                    <div>
                                        <ClassDataTooltips id='cmps11' text='CMPS11' classData={this.state.classData['CMPS11']} />
                                        {this.state.taken['CMPS11'] && <b>X</b>}
                                    </div>
                                </div>
                                <div className="or2"> or </div>
                                <div className="cmpe13">
                                    <ClassDataTooltips id='cmpe13' text='CMPE13/L' classData={this.state.classData['CMPE13']} />
                                    {this.state.taken['CMPE13'] && this.state.taken['CMPE13L'] && <b>X</b>}
                                </div>
                            </div>
                            <hr />
                            <div className={(this.state.taken['CMPS12B'] && this.state.taken['CMPS12M']) ||
                                this.introProgrammingCompleted() ? 'cmps12b completed' : 'cmps12b uncompleted'}>
                                <ClassDataTooltips id='cmps12b' text='CMPS12B' classData={this.state.classData['CMPS12B']} />
                                {this.state.taken['CMPS12B'] && this.state.taken['CMPS12M'] && <b>X</b>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <p align="center"><b>or</b></p>
                    </div>
                    <div>
                        <p align="center"><b>Honors Track</b></p>
                        <div className={this.introProgrammingCompleted() ? "honors completed" : "honors uncompleted"} 
                            id={this.introProgrammingCompleted() ? 'completedBorder' : ''}>
                            <ClassDataTooltips id='cmps13h' text='CMPS13H/L' classData={this.state.classData['CMPS13H']} />
                            {this.state.taken['CMPS13H'] && this.state.taken['CMPS13L'] && <b>X</b>}
                        </div>
                    </div>
                </div>
                <div className='math-ce-container'>
                    <div className="math-container">
                        <b>Math</b>
                        <hr />
                        <div>
                            <div className="math">
                                <div className={this.calc1Completed() ? 'calc1 completed' : 'calc1 uncompleted'}>
                                    <div className="math19a">
                                        <ClassDataTooltips id='math19a' text='MATH19A' classData={this.state.classData['MATH19A']} />
                                        {this.state.taken['MATH19A'] && <b>X</b>}
                                    </div>
                                    <div className="calc1or">or</div>
                                    <div className="math20a">
                                        <ClassDataTooltips id='math20a' text='MATH20A' classData={this.state.classData['MATH20A']} />
                                        {this.state.taken['MATH20A'] && <b>X</b>}
                                    </div>
                                </div>
                                <div className={this.calc2Completed() ? 'calc2 completed' : 'calc2 uncompleted'}>
                                    <div className="math19b">
                                        <ClassDataTooltips id='math19b' text='MATH19B' classData={this.state.classData['MATH19B']} />
                                        {this.state.taken['MATH19B'] && <b>X</b>}
                                    </div>
                                    <div className="calc2or">or</div>
                                    <div className="math20b">
                                        <ClassDataTooltips id='math20b' text='MATH20B' classData={this.state.classData['MATH20B']} />
                                        {this.state.taken['MATH20B'] && <b>X</b>}
                                    </div>
                                </div>

                                <div className={this.linearAlgCompleted() ? 'linear completed' : 'linear uncompleted'}>
                                    <div className="ams10">
                                        <ClassDataTooltips id='ams10' text='AMS10' classData={this.state.classData['AMS10']} />
                                        {this.state.taken['AMS10'] && <b>X</b>}
                                    </div>
                                    <div className="linearor">or</div>
                                    <div className="math21">
                                        <ClassDataTooltips id='math21' text='MATH21' classData={this.state.classData['MATH21']} />
                                        {this.state.taken['MATH21'] && <b>X</b>}
                                    </div>
                                </div>
                                <div className={this.state.taken["MATH23A"] ? 'math23a completed' : 'math23a uncompleted'}>
                                    <ClassDataTooltips id='math23a' text='MATH23A' classData={this.state.classData['MATH23A']} />
                                    {this.state.taken['MATH23A'] && <b>X</b>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="CE">
                        <b>Computer Engineering</b>
                        <hr />
                        <div className={this.state.taken['CMPE12'] ? 'ce12 completed' : 'ce12 uncompleted'}>
                            <ClassDataTooltips id='cmpe12l' text='CMPE12/L' classData={this.state.classData['CMPE12']} />
                            {this.state.taken['CMPE12'] && this.state.taken['CMPE12L'] && <b>X</b>}
                        </div>
                        <div className={this.state.taken['CMPE16'] ? 'ce16 completed' : 'ce16 uncompleted'}>
                            <ClassDataTooltips id='cmpe16' text='CMPE16' classData={this.state.classData['CMPE16']} />
                            {this.state.taken['CMPE16'] && <b>X</b>}
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}
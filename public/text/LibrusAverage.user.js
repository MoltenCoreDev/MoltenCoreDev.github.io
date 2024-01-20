// ==UserScript==
// @name         Średnie w librusie pomimo szkoły
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Librus jest tragiczny, dlatego przywracamy średnie nawet jak szkoła nie pozwala.
// @author       Michał
// @match        https://synergia.librus.pl/przegladaj_oceny/uczen
// @icon         https://www.google.com/s2/favicons?sz=64&domain=librus.pl
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("wczytano LibrusAverage 1.0");
    let queryString = "table.decorated:not([style='display: none;']) > tbody > tr.line0:not([id^='przedmioty']), table.decorated:not([style='display: none;']) > tbody > tr.line1:not([id^='przedmioty'])";
    let subjects = document.querySelectorAll(queryString);

    subjects.forEach(subject => {
        let grades = [];
        let semester1 = subject.querySelector("td:nth-child(3)")?.querySelectorAll("a.ocena");
        let semester2 = subject.querySelector("td:nth-child(7)")?.querySelectorAll("a.ocena");

        if (!(semester1 && semester2)) {
             return
        }
        let sem1grades = calcSemester(semester1)
        let sem2grades = calcSemester(semester2)


        let gradeWindow1 = subject.querySelector("td:nth-child(4)")
        let gradeWindow2 = subject.querySelector("td:nth-child(8)")
        if (sem1grades.length > 0) {
            gradeWindow1.innerHTML = `W: ${calcWeightedAverage(sem1grades).toFixed(2)} A: ${calcArithmeticAverage(sem1grades).toFixed(2)}`
        }
        if (sem2grades.length > 0) {
            gradeWindow2.innerHTML = `W: ${calcWeightedAverage(sem2grades).toFixed(2)} A: ${calcArithmeticAverage(sem2grades).toFixed(2)}`
        }

    })
})();

function calcSemester(gradeObjects) {
    let properGrades = ["1", "2", "3", "4", "5", "6", "1+", "2-", "2+", "3-", "3+", "4-", "4+", "5-", "5+", "6-", "6"]
    let grades = [];
    gradeObjects.forEach(grade => {
            if (properGrades.includes(grade.innerHTML)) {
                let weight = grade.title.match(/(?<=Waga: )(\d+)/g)
                if (weight != null) {
                    grades.push({ "val": grade.innerHTML, "weight": weight });
                } else {
                    grades.push({ "val": grade.innerHTML, "weight": 0 });
                }

            }
        })
    return grades
}

function calcWeightedAverage(grades) {
    let denominator = 0.0;
    let nominator = 0.0;
    grades.forEach(grade => {
        let value = parseFloat(grade.val)
        if (grade.val.includes("-")) {
            value -= .25;
        }
        if (grade.val.includes("+")) {
            value += .5;
        }
        let weight;
        if (grade.weight != undefined) {
            weight = parseFloat(grade.weight)
        }
        denominator += weight;
        nominator += weight * value;
    })
    return nominator/denominator

}

function calcArithmeticAverage(grades) {
    let gradeAmount = 0.0;
    let gradeValue = 0.0;
    grades.forEach(grade => {
        let value = parseFloat(grade.val);
        if (grade.val.includes("-")) {
            value -= .25;
        }
        if (grade.val.includes("+")) {
            value += .5;
        }
        gradeAmount += 1;
        gradeValue += value;
    })
    return gradeValue/gradeAmount
}

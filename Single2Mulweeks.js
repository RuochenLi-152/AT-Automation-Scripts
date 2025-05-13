/**
 * Script: Syncs week information from "Participants by week(All)" to "All Participants with Weeks"
 * based on student record ID and week selected. Requires matching field/table names.
 */

let table_to_update = "All Participants with Weeks";
let table_info = "Participants by week(All)";
let field_to_update = "Week#"; 
let first_name_field = "First Name";
let last_name_field = "Last Name";


let targetTable = base.getTable(table_to_update);  
let sourceTable = base.getTable(table_info);   
let inputs = input.config();

let studentId = inputs.new_record; 
let targetRecordId = inputs.student[0]; 
let selectedWeekName = inputs.week;


let studentRecord = await targetTable.selectRecordAsync(targetRecordId);
if (!studentRecord) {
    throw new Error("Student record not found.");
}
let first = studentRecord.getCellValue(first_name_field);
let last = studentRecord.getCellValue(last_name_field);

await sourceTable.updateRecordAsync(studentId,{
    [first_name_field]: first,
    [last_name_field]: last
})

let weekField = targetTable.getField(field_to_update);
if (!weekField || !weekField.options?.choices) {
    throw new Error(`❌ Could not access '${field_to_update}' field or its choices.`);
}

let weekDict = new Map();
for (let option of weekField.options.choices) {
    weekDict.set(option.name, option);
}

let targetRecord = await targetTable.selectRecordAsync(targetRecordId); // record to update
if (!targetRecord) {
    throw new Error("Target record not found.");
}

let rawWeeks = targetRecord.getCellValue(field_to_update);
let currentWeeks = Array.isArray(rawWeeks) ? rawWeeks : [];
let newWeekOption = weekDict.get(selectedWeekName);

let alreadyHasWeek = currentWeeks.some(w => w.name === selectedWeekName);
if (alreadyHasWeek) {
    output.set("message", `✅ Already registered for ${selectedWeekName}.`);
} else {
    let updatedWeeks = [...currentWeeks, newWeekOption];
    console.log(updatedWeeks);
    await targetTable.updateRecordAsync(targetRecordId, {
        [field_to_update]: updatedWeeks
    });
    output.set("message", `✅ Added ${selectedWeekName} for ${studentRecord.getCellValue(first_name_field)} ${studentRecord.getCellValue(last_name_field)}.`);
}

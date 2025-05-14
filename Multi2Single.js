/* When weeks are added/deleted from "All Participants with Weeks"'s
Week# field, update the records in "Participants by weeks(all)" 
Inputs needed: 
    Week#
    Record ID*/

    let recordId = input.config().recordId;
    let sourceTable = base.getTable("All Participants with Weeks");
    let targetTable = base.getTable("Participants by week(All)");
    
    let record = await sourceTable.selectRecordAsync(recordId);
    if (!record) {
        throw new Error("❌ Record not found.");
    }
    
    let firstName = record.getCellValueAsString("First Name") || '';
    let lastName = record.getCellValueAsString("Last Name") || '';
    let weekValues = record.getCellValue("Week#") || [];
    let linkOutLinks = record.getCellValue("LinkOut - Participants by week") || [];
    // console.log(linkOutLinks);
    
    let currentWeeks = weekValues.map(w => w?.name).filter(Boolean);
    let linkOutIds = linkOutLinks.map(link => link?.id).filter(Boolean);
    // console.log(linkOutIds);
    
    let allLinkedRecords = await targetTable.selectRecordsAsync();
    let linkedRecords = allLinkedRecords.records.filter(r => linkOutIds.includes(r.id));
    // console.log(linkedRecords);
    
    let linkedWeeks = linkedRecords.map(r => r.getCellValue("Week#")?.name).filter(Boolean);
    let weeksToAdd = currentWeeks.filter(w => !linkedWeeks.includes(w));
    let weeksToDelete = linkedWeeks.filter(w => !currentWeeks.includes(w));
    
    // Create records
    for (let weekName of weeksToAdd) {
        await targetTable.createRecordAsync({
            "First Name": firstName,
            "Last Name": lastName,
            "Week#": { name: weekName },
            "Link to All Par with Weeks": [{ id: record.id }],
        });
        console.log(`Created: ${firstName} ${lastName} - ${weekName}`);
    }
    
    // Delete records
    for (let weekName of weeksToDelete) {
        let recordToDelete = linkedRecords.find(r => r.getCellValue("Week#")?.name === weekName);
        if (recordToDelete) {
            await targetTable.deleteRecordAsync(recordToDelete.id);
            console.log(`Deleted: ${firstName} ${lastName} - ${weekName}`);
        }
    }
    
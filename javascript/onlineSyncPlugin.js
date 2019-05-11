//=====CORE MECHANICS=====
$(document).ready(function(){
	allGroupZones.forEach(function(e)
	{
		e.SetupDisplay();
	});

    $('select').selectpicker();

	LoadInformation();
});

let socket = io("https://zootr-tracker-online.herokuapp.com:443");

const receiveAdress = "receiveData.php";
const sendAdress = "sendData.php";
const generateTrackerID = "generateTrackerID.php";

socket.on
(
    'item-change-back',
    function(data)
    {
        allChecks.get(data['checkid']).SetItem(allItems.get(data['itemid'].toString()));
    }
)

socket.on
(
    'zone-change-back',
    function(data)
    {
        allZones[data['zoneid']].SetZoneHint(data['state']);
    }
)

socket.on
(
    'hint-change-back',
    function(data)
    {
        allChecks.get(data['checkid']).SetHintState(data['hintstate']);
    }
)

function SyncHintOfCheck(checkid, hintstate)
{
    $.ajax
    ({
        type: "POST",
        url: sendAdress,
        data: {	'trackerID' : $_GET['trackerID'],
			'type' : "hint",
            'dataName' : checkid,
            'dataValue': hintstate ? 1 : 0},
		success: function (obj)
		{
			console.log(obj);
		},

		error: function(xhr, textStatus, error) {
			console.log(xhr.responseText);
			console.log(xhr.statusText);
			console.log(textStatus);
			console.log(error);

		}
    });

    socket.emit(
        'hint-change',
        {
            'checkid' : checkid,
            'hintstate': hintstate
        }
    );
}

function SyncZoneState(zoneid, state)
{
    $.ajax
    ({
        type: "POST",
        url: sendAdress,
        data: {	'trackerID' : $_GET['trackerID'],
			'type' : "zone",
            'dataName' : zoneid,
            'dataValue': state}
    });

    socket.emit(
        'zone-change',
        {
            "zoneid" : zoneid,
            "state" : state
        }
    );
}

function SyncItemOfCheck(checkid, itemid)
{
    $.ajax
    ({
        type: "POST",
        url: sendAdress,
        data: {	'trackerID' : $_GET['trackerID'],
			'type' : "item",
            'dataName' : checkid,
            'dataValue': itemid}
    });

    socket.emit(
        'item-change',
        {
            "checkid" : checkid,
            "itemid" : itemid
        }
    );
}

function LoadInformation()
{
    $.ajax
    ({
        type: "POST",
        url: receiveAdress,
        dataType: 'json',
        data: {'trackerID' : $_GET['trackerID']},
        success: function (obj)
        {
			SyncEverything(obj)
        }
    });
}

function SyncEverything(data)
{
	let dictItem = data.item[0];
	let keysItem  = Object.keys(dictItem ).slice(1);
	for(let key of keysItem )
	{
		allChecks.get(key.toString()).SetItem(allItems.get(dictItem[key]));
	}

	let dictHint = data.hint[0];
	let keysHint = Object.keys(dictHint).slice(1);
	for(let key of keysHint)
	{
		allChecks.get(key.toString()).SetHintState(dictHint[key] === "1");
	}

	let dictZone = data.zone[0];
	let keysZone = Object.keys(dictZone).slice(1);
	for(let key of keysZone)
	{
		allZones[key.toString()].SetZoneHint(parseInt(dictZone[key]));
	}
}
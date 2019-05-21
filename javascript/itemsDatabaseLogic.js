const idParentGrid = "cardGrid";
const iconFolder = "icons/";
const itemsFolder = iconFolder + "items/";
const sizeIcons = 24;

let takeNonLogicChecks = false;

class Item
{
	constructor(id, displayName, itemImage, itemMainCategory = 'Item')
	{
		this._id = id;
		this._displayName = displayName;
		this._itemImage = itemImage;
		this._itemMainCategory = itemMainCategory;
		this._childItem = null; //Upgrade
        this._parentItem = null; //Downgrade
		this._itemType = this;
		this._requiredItem = null;
		this._category = 'None';
		this._unique = false;
		
		allItems.set(id.toString(), this);
	}
	
	SetItemType(itemType)
	{
		this._itemType = itemType;
		return this;
	}
	
	SetChild(childItem)
	{
		this._childItem = childItem;
		return this;
	}

    SetParent(parentItem)
    {
        this._parentItem = parentItem;
        return this;
    }
	
	SetCategory(category)
	{
		this._category = category;
		if(!allCategories.includes(category))
		{
			allCategories.push(category);
		}
		return this;
	}
	
	SetRequiredItems(requiredItem)
	{
		this._requiredItem = requiredItem;
		return this;
	}

	SetUnique()
	{
		this._unique = true;
		return this;
	}

	GetEquivalents()
    {
        let equivalents = [];
        equivalents.push(this);
        let parent = this._parentItem;
        while (parent !== null && parent !== undefined) {
            equivalents.push(parent);
            parent = parent._parentItem;
        }
        return equivalents;
    }

	IsEqual(item2)
	{
		if(item2._id === this._id)
			return true;

		return false;
	}

    IsEquivalent(item2)
	{
		if(item2._id === this._id)
			return true;

		if(this.GetEquivalents().map(i => i._id).includes(item2._id))
			return true;

		return false;
	}
}

class Stone extends Item
{
	constructor(id, displayName, itemImage)
	{
		super(id, displayName, itemImage, 'Stones');
		this.SetUnique();
	}
}

class Song extends Item
{
	constructor(id, displayName, itemImage)
	{
		super(id, displayName, itemImage, 'Songs');
		this.SetUnique();
	}
}

class ItemDungeon extends Item
{
	constructor(id, displayName, itemImage, dungeonLinked)
	{
		super(id, displayName, itemImage, 'Dungeons');
		this._dungeonLinked = dungeonLinked;
	}
}

class ItemKey extends Item
{
	constructor(id, displayName, itemImage, dungeonLinked)
	{
		super(id, displayName, itemImage, 'Dungeons');
		this._dungeonLinked = dungeonLinked;
	}
}

class ItemBossKey extends Item
{
	constructor(id, displayName, itemImage, dungeonLinked)
	{
		super(id, displayName, itemImage, 'Dungeons');
		this._dungeonLinked = dungeonLinked;
	}
}

class ZoneGroup
{
	constructor(groupColor, elementsColor)
	{
		this._groupColor = groupColor;
		this._elementsColor = elementsColor;
		this._zones = [];

		this._html_card = null;
		this._html_subCard = null;

		allGroupZones.push(this);
	}

	RegisterZone(zone)
	{
		this._zones.push(zone);
	}

	SetupDisplay()
	{
		if(!this._displayed)
		{
			let html_parent = document.getElementById(idParentGrid);

			this._html_card = document.createElement('div');
			this._html_card.setAttribute('class', 'col-sm-12 col-md-6 col-lg-4 col-xl-3');

			this._html_subCard = document.createElement('div');
			this._html_subCard.setAttribute('class', 'card shadow margen-abajo');
			this._html_subCard.setAttribute('style', 'margin-top:6px; margin-bottom:6px; background:' + this._groupColor + ';');

			html_parent.appendChild(this._html_card);

			this._html_card.appendChild(this._html_subCard);

			for(let e of this._zones)
			{
				e.SetupDisplay();
			}

			this._displayed = true;
		}
	}
}

class Zone
{
	constructor(group, zoneName, zoneId)
	{
		this._group = group;
		this._zoneName = zoneName;
		this._zoneId = zoneId;
		this._ageRequiered = 0;
		this._zoneHint = 0;
		this._canHaveHint = true;
		this._checks = [];
		this._displayed = false;
		this._enteringZoneLogic = function () {
            return true;
        };

		group.RegisterZone(this);
        allZones[this._zoneId] = this;
	}

	SetCanHaveHint(canHaveHint)
	{
		this._canHaveHint = canHaveHint;
		return this;
	}

	//0 = None
	//1 = Child
	//2 = Adult
	SetAgeRequired(ageRequired)
	{
		this._ageRequired = ageRequired;
		return this;
	}

	SetEnteringZoneLogic(enteringZoneLogic)
	{
		this._enteringZoneLogic = enteringZoneLogic;
		return this;
	}

	//0 = Normal
	//1 = Way of the Hero
	//2 = Barren
	SetZoneHint(zoneHint)
	{
		this._zoneHint = zoneHint;

		if(this._displayed)
		{
			if(this._zoneHint === 0)
			{
				this._html_title_badge.setAttribute('class', 'badge badge-light');
				this._html_title_icon.setAttribute('src', iconFolder + 'normal.png');
                $(this._html_title_button).html('<img src="icons/normal.png"> Nothing Special in this Area');
			}
			else if(this._zoneHint === 1)
			{
				this._html_title_badge.setAttribute('class', 'badge badge-success');
				this._html_title_icon.setAttribute('src', iconFolder + 'woth.png');
                $(this._html_title_button).html('<img src="icons/woth.png"> WOTH Area</i>');
			}
			else if(this._zoneHint === 2)
			{
				this._html_title_badge.setAttribute('class', 'badge badge-danger');
				this._html_title_icon.setAttribute('src', iconFolder + 'barren.png');
                $(this._html_title_button).html('<img src="icons/barren.png"> Barren Area</i>');
			}

            this._html_title_button.classList.toggle('btn-secondary', this._zoneHint === 0);
            this._html_title_button.classList.toggle('btn-success', this._zoneHint === 1);
            this._html_title_button.classList.toggle('btn-danger', this._zoneHint === 2);
		}

		return this;
	}

	RegisterCheck(check)
	{
		this._checks.push(check);
	}

	SetupDisplay()
	{
		if(!this._displayed)
		{
			let html_parent = this._group._html_subCard;

			this._html_card = document.createElement('div');
			this._html_card.setAttribute('class', 'card');
			this._html_card.setAttribute('style', 'margin:12px; background:' + this._group._elementsColor + ';');

			this._html_itemDisplayer = document.createElement('div');
			this._html_itemDisplayer.setAttribute('class', 'd-inline text-center iteminfo');
			this._html_itemDisplayer.setAttribute('id', this._zoneId + '-items');

			let html_zone = document.createElement('a');
			html_zone.setAttribute('class', 'card-link');
			html_zone.setAttribute('data-toggle', 'collapse');
			html_zone.setAttribute('href', '#' + this._zoneId);

			this._html_checkList = document.createElement('ul');
			this._html_checkList.setAttribute('class', 'collapse grid card list-group');
			this._html_checkList.setAttribute('id', this._zoneId);

			html_parent.appendChild(this._html_card);

			this._html_card.appendChild(this._html_itemDisplayer);
			this._html_card.appendChild(html_zone);
			this._html_card.appendChild(this._html_checkList);

			let html_title = document.createElement('div');
			html_title.setAttribute('class', 'text-center');

			let html_title_h5 = document.createElement('h5');

			this._html_title_badge = document.createElement('span');
			this._html_title_badge.setAttribute('style', 'width:75%;');
			$(this._html_title_badge).html(this._zoneName + " (" + this._checks.length + ")");

			html_zone.appendChild(html_title);
			html_title.appendChild(html_title_h5);
			html_title_h5.appendChild(this._html_title_badge);

			if(this._canHaveHint) {
				this._html_title_button = document.createElement("button");
				this._html_title_button.setAttribute('class', 'btn btn-sm btn-secondary float-left');
				this._html_title_button.setAttribute('type', "button");
			}

			this._html_title_icon = document.createElement('img');
			this._html_title_icon.setAttribute('class', 'float-right');
			if (this._zoneHint === 0) {
				this._html_title_badge.setAttribute('class', 'badge badge-light');
				if(this._canHaveHint)
					this._html_title_icon.setAttribute('src', iconFolder + 'normal.png');
				$(this._html_title_button).html('<img src="icons/normal.png"> Nothing Special in this Area');
			} else if (this._zoneHint === 1) {
				this._html_title_badge.setAttribute('class', 'badge badge-success');

				if(this._canHaveHint)
					this._html_title_icon.setAttribute('src', iconFolder + 'woth.png');
				$(this._html_title_button).html('<img src="icons/woth.png"> WOTH Area');
			} else if (this._zoneHint === 2) {
				this._html_title_badge.setAttribute('class', 'badge badge-danger');

				if(this._canHaveHint)
					this._html_title_icon.setAttribute('src', iconFolder + 'barren.png');
				$(this._html_title_button).html('<img src="icons/barren.png"> Barren Area');
			}

			if(this._canHaveHint)
				this._html_title_badge.appendChild(this._html_title_icon);

            let currentZone = this;

			if(this._canHaveHint) {
				this._html_title_button.onclick = function () {
					let zoneState = (currentZone._zoneHint + 1) % 3;
					currentZone.SetZoneHint(zoneState);

					SyncZoneState(currentZone._zoneId, zoneState);
				};

				this._html_checkList.appendChild(this._html_title_button);
			}

			for(let e of this._checks)
			{
				e.SetupDisplay();
			}

			this._displayed = true;
		}
	}
}

class Dungeon extends Zone
{
	constructor(group, zoneName, zoneId)
	{
		super(group, zoneName, zoneId);

		this._keyQuantity = 0;
		this._maxKeyQuantity = 0;
		this._bossKeyGot = false;
		this._bossKeyRequired = false;
	}

	SetKeyQuantity(keyQuantity)
	{
		this._keyQuantity = keyQuantity;

		if(this._displayed)
		{
			$(this._html_title_key_count).html(this._keyQuantity + '/' + this._maxKeyQuantity);
		}

		return this;
	}

	SetKeyRequired(maxKeyQuantity)
	{
		this._maxKeyQuantity = maxKeyQuantity;
		return this;
	}

	SetBossKeyState(bossKeyGot)
	{
		this._bossKeyGot = bossKeyGot;

		if(this._displayed)
		{
			this._html_title_bkey_check.style.opacity = (bossKeyGot ? '1' : '0.5');
			this._html_title_bkey_check.style.filter = (bossKeyGot ? "grayscale(0%)" : "grayscale(100%)");
		}

		return this;
	}

	SetBossKeyRequired()
	{
		this._bossKeyRequired = true;
		return this;
	}

	SetupDisplay()
	{
		if(!this._displayed)
		{
			if(this._maxKeyQuantity > 0)
			{
				this._html_title_secondline = document.createElement('div');
				this._html_title_secondline.setAttribute('class', 'd-flex');
				this._html_title_secondline.setAttribute('style', 'justify-content: space-evenly');

				let html_title_keyGroup = document.createElement('div');
				html_title_keyGroup.setAttribute('class', 'd-flex');

				this._html_title_secondline.appendChild(html_title_keyGroup);

				let html_title_key_icon = document.createElement('img');
				html_title_key_icon.setAttribute('src', itemsFolder + 'key.png');
				html_title_key_icon.setAttribute('class', '');
				html_title_key_icon.setAttribute('style', 'height:' + 15 + 'px; width:' + 15 + 'px; margin-right:6px;');

				html_title_keyGroup.appendChild(html_title_key_icon);

				this._html_title_key_count = document.createElement('div');
				this._html_title_key_count.setAttribute('class', 'count-font');
				$(this._html_title_key_count).html(this._keyQuantity + '/' + this._maxKeyQuantity);

				html_title_keyGroup.appendChild(this._html_title_key_count);

				if(this._bossKeyRequired)
				{
					let html_title_keybossGroup = document.createElement('div');
					html_title_keybossGroup.setAttribute('class', 'd-flex');

					this._html_title_secondline.appendChild(html_title_keybossGroup);

					let html_title_bkey_icon = document.createElement('img');
					html_title_bkey_icon.setAttribute('src', itemsFolder + 'bosskey.png');
					html_title_bkey_icon.setAttribute('class', '');
					html_title_bkey_icon.setAttribute('style', 'height:' + 15 + 'px; width:' + 15 + 'px;');

					html_title_keybossGroup.appendChild(html_title_bkey_icon);

					this._html_title_bkey_check = document.createElement('img');
					this._html_title_bkey_check.setAttribute('src', iconFolder + 'check.png');
					this._html_title_bkey_check.setAttribute('class', '');
					this._html_title_bkey_check.setAttribute('style', 'height:' + 15 + 'px; width:' + 15 + 'px; filter:grayscale(100%); opacity:0.5	');

					html_title_keybossGroup.appendChild(this._html_title_bkey_check);
				}
			}

			super.SetupDisplay();

			if(this._maxKeyQuantity > 0)
			{
				this._html_title_badge.appendChild(this._html_title_secondline);
			}
		}
	}
}

class Check
{
	constructor(checkId, checkName, linkedZone)
	{
		this._checkId = checkId;
		this._checkName = checkName;
		this._linkedZone = linkedZone;
		this._states = {logic:true, hint:false}
		this._availableItems = ['Item'];
		if(this._linkedZone instanceof Dungeon)
			this._availableItems.push('Dungeons');
		this._displayed = false;
		this._locked = 1;

        this._validateFunction = function () {
            return true;
        };

		this._item = item_UnknownItem;

        this._basic_hint = false;
        this._basic_lock = 0;
        this._basic_item = item_UnknownItem;

		if(checkProperties.get(this._checkId) !== null && checkProperties.get(this._checkId) !== undefined)
		{
			console.error("Duplicate detected : " + this._checkId + "\nIf this occurs, this mean that");
		}
		checkProperties.set(this._checkId, {id: checkId, state: this._states, item: this._item});

		linkedZone.RegisterCheck(this);
		allChecks.set(this._checkId, this);
	}

	SetLogicValidator(validator)
    {
        this._validateFunction = validator;
        return this;
    }

	//0 = Chest / Freestanding
	//1 = Song
	//2 = Stones
	//3 = Skulltula
	SetCheckType(checkType)
	{
		if(checkType === 0)
		{
			this.SetItemsAvailable('Items');
		}
		else if(checkType === 1)
		{
			this.SetItemsAvailable('Songs');
		}
		else if(checkType === 2)
		{
			this.SetItemsAvailable('Stones');
		}
		else if(checkType === 3)
		{
			this.SetItemsAvailable('Skulltula');
		}

		return this;
	}

	SetHintState(isHint, lockState)
	{
        if(lockState)
            this._basic_hint = isHint;

		if(this._states.hint !== isHint) {
            if (!this._states.hint && isHint && this._item != null && this._item !== item_UnknownItem) {
                if (this._item instanceof ItemKey) {
                    this._item._dungeonLinked.SetKeyQuantity(this._item._dungeonLinked._keyQuantity - 1);
                } else if (this._item instanceof ItemBossKey) {
                    this._item._dungeonLinked.SetBossKeyState(false);
                }
            }
            if (this._states.hint && !isHint && this._item != null && this._item !== item_UnknownItem) {
                if (this._item instanceof ItemKey) {
                    this._item._dungeonLinked.SetKeyQuantity(this._item._dungeonLinked._keyQuantity + 1);
                } else if (this._item instanceof ItemBossKey) {
                    this._item._dungeonLinked.SetBossKeyState(true);
                }
            }

            this._states.hint = isHint;

			RefreshAllLogic();

			if (this._displayed) {
				if (isHint) {
					$(this._html_buttonIcon).html(' Hint');
				} else {
					$(this._html_buttonIcon).html(' Collected');
				}
				this._html_checkImage.classList.toggle('item-display-normal', !isHint);
				this._html_checkImage.classList.toggle('item-display-hint', isHint);
				this._html_checkImage.classList.toggle('item-display-nologic', !this._states.logic && !isHint);
				this._html_button.classList.toggle('btn-success', !isHint);
				this._html_button.classList.toggle('btn-secondary', isHint);
				this._html_buttonIcon.classList.toggle('fa-check', !isHint);
				this._html_buttonIcon.classList.toggle('fa-info', isHint);
			}
		}

		return this;
	}

	SetItemsAvailable(... availableItems)
	{
		this._availableItems = availableItems
		return this;
	}

	RecalculateLogic()
	{
		takeNonLogicChecks = false;
        let inLogic = this._linkedZone._enteringZoneLogic() && this._validateFunction();

        takeNonLogicChecks = true;
        let isAccessible = this._linkedZone._enteringZoneLogic() && this._validateFunction();

		if(inLogic !== this._states.logic) {
			this._states.logic = inLogic;

            RefreshAllLogic();

			if (this._displayed) {
				if (inLogic) {
					this._html_title_logic.setAttribute('class', 'far fa-check-circle float-right');
					this._html_title_logic.style.color = "#24ba1f";
				}
				else {
					this._html_title_logic.setAttribute('class', 'far fa-times-circle float-right');
					this._html_title_logic.style.color = "#ef2d2d";
				}
			}
		}
		if (this._displayed) {
			this._html_checkImage.classList.toggle('item-display-nologic', !inLogic && !isAccessible && !this._states.hint);
			this._html_checkImage.classList.toggle('item-display-accessible', !inLogic && isAccessible && !this._states.hint);
		}
		return this;
	}

	//0 = Unlocked
	//1 = Hint State Locked
	//2 = Locked Item
	//3 = Everything Locked
	SetLockedState(locked, lockState)
	{
		if(locked !== this._locked) {
			this._locked = locked;

			if (this._displayed) {
				this._html_button.toggleAttribute('disabled', locked === 1 || locked === 3);
				this._html_select.toggleAttribute('disabled', locked === 2);
			}
		}

		if(lockState)
		    this._basic_lock = locked;

		return this;
	}

	SetItem(item, lockItem = false, refreshSelect = true)
	{
        if(lockItem)
            this._basic_item = item;

		if(item !== this._item) {
			if (!this._states.hint && this._item !== item_UnknownItem) {
				if (this._item instanceof ItemKey) {
					this._item._dungeonLinked.SetKeyQuantity(this._item._dungeonLinked._keyQuantity - 1);
				} else if (this._item instanceof ItemBossKey) {
					this._item._dungeonLinked.SetBossKeyState(false);
				}
			}
			if (!this._states.hint && item !== item_UnknownItem) {
				if (item instanceof ItemKey) {
					item._dungeonLinked.SetKeyQuantity(item._dungeonLinked._keyQuantity + 1);
				} else if (item instanceof ItemBossKey) {
					item._dungeonLinked.SetBossKeyState(true);
				}
			}

			this._item = item;

			checkProperties.get(this._checkId).item = item;

            RefreshAllLogic();

			if (this._displayed) {
				if(refreshSelect)
					$(this._html_select).selectpicker('val', item._id.toString());
				this._html_checkImage.setAttribute('src', itemsFolder + item._itemImage + '.png')
			}

			if (this._item === item_UnknownItem) {
				this.SetHintState(false);
				this.SetLockedState(1);
			} else {
				if (this._locked < 2) {
					this.SetLockedState(0);
				}
			}

		}

		return this;
	}

	SetupDisplay()
	{
		if(!this._displayed)
		{
			this.RecalculateLogic();
			let currentCheck = this;

			let html_parent = this._linkedZone._html_checkList;

			this._html_listElement = document.createElement("li");
			this._html_listElement.setAttribute('class', 'list-group-item');

			html_parent.appendChild(this._html_listElement);

			this._html_title = document.createElement("span");
			this._html_title.setAttribute('id', this._checkId + "-header");
			this._html_title.setAttribute('class', 'badge badge-dark');
			this._html_title.setAttribute('style', 'width:100%');
			this._html_title.innerHTML = this._checkName;

			this._html_listElement.appendChild(this._html_title);

			this._html_title_logic = document.createElement("i");
			if(this._states.logic)
			{
				this._html_title_logic.setAttribute('class', 'far fa-check-circle float-right');
				this._html_title_logic.style.color = "#24ba1f";
			}
			else
			{
				this._html_title_logic.setAttribute('class', 'far fa-times-circle float-right');
				this._html_title_logic.style.color = "#ef2d2d";
			}
			this._html_title_logic.setAttribute('data-toggle', 'tooltip');
			this._html_title_logic.setAttribute('data-placement', 'bottom');

			let tooltipLogic = "<b>Logic Indicator</b>";
			this._html_title_logic.setAttribute('title', tooltipLogic);
            this._html_title_logic.setAttribute('data-html', true);
			$(this._html_title_logic).tooltip();

			this._html_title.appendChild(this._html_title_logic);

			this._html_select = document.createElement("select");
			this._html_select.setAttribute('id', this._checkId );
			this._html_select.setAttribute('class', 'selectpicker show-tick');
			this._html_select.setAttribute('data-live-search', 'true');
			this._html_select.setAttribute('data-width', '100%');
			this._html_select.setAttribute('data-hide-disabled', 'true');
			this._html_select.toggleAttribute('disabled', this._locked === 2);

			this._html_listElement.appendChild(this._html_select);

			this._html_button = document.createElement("button");
			this._html_button.setAttribute('class', 'btn btn-sm btn-block checked');
			this._html_button.setAttribute('type', "button");
			this._html_button.toggleAttribute('disabled', this._locked === 1 || this._locked === 3);

            this._html_buttonIcon = document.createElement("div");
			this._html_buttonIcon.setAttribute('class', 'fas fa-check');

			this._html_listElement.appendChild(this._html_button);
			this._html_button.appendChild(this._html_buttonIcon);

			let html_select = this._html_select;
			let selectedItem = this._item;
			let availableCategories = this._availableItems;

			for(let category of allCategories)
			{
				let optgroup_e = document.createElement("optgroup");
				optgroup_e.setAttribute('label', category);

				html_select.appendChild(optgroup_e);

				for(let i of allItems.values())
				{
					if(i._category === category)
					{
						let option_e = document.createElement("option");
						option_e.setAttribute('data-content', '<img alt="option-img" src="' + itemsFolder + i._itemImage + '.png" style="height:' + sizeIcons + 'px; width:' + sizeIcons + 'px">'+ ' <b>' + i._displayName + '</b>');
						option_e.setAttribute('data-tokens', category);
						option_e.setAttribute('value', i._id);

						if(i === selectedItem)
						{
							option_e.setAttribute('selected', '');
						}

						option_e.toggleAttribute('disabled', !currentCheck.ValidatingFunction(i));
						optgroup_e.appendChild(option_e);
					}
				}
			}

			this._html_checkImage = document.createElement("img");
			this._html_checkImage.setAttribute('id', this._checkId + "-display");
			this._html_checkImage.setAttribute('data-toggle', "tooltip");
			this._html_checkImage.setAttribute('title', this._checkName);
			this._html_checkImage.setAttribute('src', itemsFolder + this._item._itemImage + '.png');
			this._html_checkImage.setAttribute('style', 'height:' + sizeIcons + 'px; width:' + sizeIcons + 'px');
			$(this._html_checkImage).tooltip();

			if(this._states.hint)
			{
				$(this._html_buttonIcon).html(' Hint');
			}
			else
			{
				$(this._html_buttonIcon).html(' Collected');
			}
			this._html_checkImage.classList.toggle('item-display-normal', !this._states.hint);
			this._html_checkImage.classList.toggle('item-display-hint', this._states.hint);
			this._html_checkImage.classList.toggle('item-display-nologic', !this._states.logic && !this._states.hint);
			this._html_button.classList.toggle('btn-success', !this._states.hint);
			this._html_button.classList.toggle('btn-secondary', this._states.hint);
			this._html_buttonIcon.classList.toggle('fa-check', !this._states.hint);
			this._html_buttonIcon.classList.toggle('fa-info', this._states.hint);

			this._linkedZone._html_itemDisplayer.appendChild(this._html_checkImage);

			this._html_select.addEventListener("change", function()
			{
				let itemId = $(this).val();
				let item = allItems.get(itemId);
				currentCheck.SetItem(item, false, false);

				SyncItemOfCheck(currentCheck._checkId, item._id);
			});

			this._html_button.onclick = function()
			{
				let flag = !currentCheck._states.hint;
				currentCheck.SetHintState(flag);

                SyncHintOfCheck(currentCheck._checkId, flag);
			};

			this._displayed = true;
		}
	}

	Reset()
    {
        this.SetHintState(this._basic_hint);
        this.SetItem(this._basic_item);
        this.SetLockedState(this._basic_lock);
    }

	ValidatingFunction(i)
	{
		let flag = false;

		if(i._itemMainCategory === "Always")
		{
			flag = true;
		}
		else if(this._availableItems.includes(i._itemMainCategory) && i._itemMainCategory !== "Dungeons")
		{
			flag = true;
		}
		else if(this._availableItems.includes("Item") && i._itemMainCategory === "Dungeons")
		{
			if(i instanceof ItemKey || i instanceof ItemBossKey)
			{
				if(i._dungeonLinked === this._linkedZone || keySanity)
				{
					flag = true;
				}
			}
			else
			{
				flag = this._linkedZone instanceof Dungeon;
			}
		}

		return flag;
	}
}

class CheckStat extends Check
{
	constructor(checkId, checkName, linkedZone, validateFunction)
	{
		super(checkId, checkName, linkedZone);
		this._itemValidateFunction = validateFunction;
		this.SetLockedState(3);
	}

	ValidatingFunction(i)
	{
		return this._itemValidateFunction(i);
	}
}

function RefreshAllLogic()
{
    for (let check of allChecks.values()) {
        check.RecalculateLogic();
    }
}

function ResetAll() {
    for (let check of allChecks.values()) {
        check.Reset();
    }

    RefreshAllLogic();
}

function IsCheckInLogic(check)
{
    if (check !== undefined)
        return check._states.logic;
    return false;
}

function DoesHaveThoseItems(items)
{
    let itemsGot = [...checkProperties.values()].filter(function (check) {
    	return !check.state.hint && (check.state.logic || takeNonLogicChecks) && check.item !== item_UnknownItem;
	}).map(check => check.item);
	let itemsToVerify = [...items];

    let commonJIndex = [];

	if(itemsGot.length < itemsToVerify.length)
	{
		return false;
	}
	else {
		let i = 0;
		while (i < itemsToVerify.length && commonJIndex.length < itemsGot.length && itemsToVerify.length > commonJIndex.length) {
			let item = itemsToVerify[i];
			for (let j = 0; j < itemsGot.length; j++) {
				if (!commonJIndex.includes(j) && itemsGot[j].IsEquivalent(item)) {
					commonJIndex.push(j);
					break;
				}
			}
			i++;
		}
        return itemsToVerify.length === commonJIndex.length;
	}
}

function DoesHaveAnyOfThoseItems(items)
{
    let itemsGot = [...checkProperties.values()].filter(function (check) {
        return !check.state.hint && (check.state.logic || takeNonLogicChecks) && check.item !== item_UnknownItem;
    }).map(check => check.item);
    let itemsToVerify = [...items];

    let anyCommon = false;
    let i = 0;
    while (i < itemsToVerify.length && !anyCommon) {
        let item = itemsToVerify[i];
        for (let j = 0; j < itemsGot.length; j++) {
            if (itemsGot[j].IsEquivalent(item)) {
                anyCommon = true;
                break;
            }
        }
        i++;
    }
    return anyCommon;
}

function SubLogic_GerudoFortressAccess()
{
    return DoesHaveAnyOfThoseItems([song_Epona, item_Longshot]) || startMemberCard;
}

function SubLogic_CarpenterRescueAccess()
{
    return DoesHaveAnyOfThoseItems([item_Bow1, item_Hookshot, item_HoverBoots]) || rescueOne
        || startMemberCard;
}

function SubLogic_GoronTunicAccess()
{
    return (DoesHaveThoseItems([item_GoronTunic])
        || (DoesHaveThoseItems([item_Wallet1])
            && DoesHaveAnyOfThoseItems([item_Bow1, item_Strength1, item_BombBag1])))
        || fewerTunics;
}

function SubLogic_ZoraTunicAccess()
{
    return (DoesHaveThoseItems([item_ZoraTunic])
        || (DoesHaveThoseItems([item_Wallet2, item_EmptyBottle, song_Zelda])))
        || fewerTunics;
}

function SubLogic_LensOfTruth(checkType = "Always")
{
    if(checkType === "CMG")
        return DoesHaveThoseItems([item_Lens]);

    return true;
}

function SubLogic_GanonTemple_TrialForest() {
    return DoesHaveAnyOfThoseItems([item_FireArrow, item_Din]);
}

function SubLogic_GanonTemple_TrialFire() {
    return SubLogic_GoronTunicAccess() && DoesHaveAnyOfThoseItems([item_Longshot , item_Strength3]);
}

function SubLogic_GanonTemple_TrialWater() {
    return  DoesHaveAnyOfThoseItems([item_EmptyBottle , item_Hammer]);
}

function SubLogic_GanonTemple_TrialSpirit() {
    return DoesHaveAnyOfThoseItems([item_MirrorShield, item_Bombchus, item_Hookshot]);
}

function SubLogic_GanonTemple_TrialShadow() {
    return DoesHaveAnyOfThoseItems([item_Hammer])
        && (DoesHaveThoseItems([item_FireArrow, item_HoverBoots])
            || DoesHaveThoseItems([item_Longshot, item_HoverBoots])
            || DoesHaveThoseItems([item_Longshot, item_Din]));
}

function SubLogic_GanonTemple_TrialSpirit() {
    return DoesHaveAnyOfThoseItems([item_Strength3, item_Hookshot, item_keyGanon, item_keyGanon]);
}

function SubLogic_GanonTemple_BossKeyLogic() {
    return SubLogic_GanonTemple_TrialForest()
    && SubLogic_GanonTemple_TrialFire()
    && SubLogic_GanonTemple_TrialWater()
    && SubLogic_GanonTemple_TrialSpirit()
    && SubLogic_GanonTemple_TrialShadow()
    && SubLogic_GanonTemple_TrialSpirit();
}

function SubLogic_FireTemple_EarlyClimb() {
    return DoesHaveThoseItems([item_keyFire, item_keyFire, item_keyFire, item_Strength1]) && DoesHaveThoseItems([item_BombBag1, item_Bow1, item_Hookshot]);
}

function SubLogic_FireTemple_FireMazeEscape() {
    return DoesHaveThoseItems([item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire])
        && DoesHaveThoseItems([item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_HoverBoots, item_Hammer])
}

function SubLogic_SpiritTemple_CentralChamberAccess() {
    return DoesHaveThoseItems([item_keySpirit])
         && DoesHaveAnyOfThoseItems([item_BombBag1, item_Strength2]);
}

function SubLogic_GanonCastleAccess() {
    return DoesHaveThoseItems([stone_Forest, stone_Fire, stone_Water, stone_Shadow, stone_Spirit, stone_Light]);
}

const checkProperties = new Map();
const allGroupZones = [];
const allZones = [];
const allItems = new Map();
const allChecks = new Map();
const allCategories = [];

//=====ITEMS=====
//Unknown
const item_UnknownItem = new Item(0, "Unknown", "unknown", "Always").SetCategory("Unknown");

//Stones
const stone_Emerald = new Stone(1, "Kokiri's Emerald", "emerald").SetCategory("Stones");
const stone_Ruby = new Stone(2, "Goron's Ruby", "ruby").SetCategory("Stones");
const stone_Saphir = new Stone(3, "Zora's Saphir", "saphir").SetCategory("Stones");

//Medaillons
const stone_Forest = new Stone(4, "Forest Medaillon", "forestmedal").SetCategory("Medaillons");
const stone_Fire = new Stone(5, "Fire Medaillon", "firemedal").SetCategory("Medaillons");
const stone_Water = new Stone(6, "Water Medaillon", "watermedal").SetCategory("Medaillons");
const stone_Shadow = new Stone(7, "Shadow Medaillon", "shadowmedal").SetCategory("Medaillons");
const stone_Spirit = new Stone(8, "Spirit Medaillon", "spiritmedal").SetCategory("Medaillons");
const stone_Light = new Stone(9, "Light Medaillon", "lightmedal").SetCategory("Medaillons");

//Songs (Tools)
const song_Zelda = new Song(10, "Zelda Song", "zeldasong").SetCategory("Tool Song");
const song_Epona = new Song(11, "Epona Song", "eponasong").SetCategory("Tool Song");
const song_Saria = new Song(12, "Saria Song", "sariasong").SetCategory("Tool Song");
const song_Sun = new Song(13, "Sun Song", "eponasong").SetCategory("Tool Song");
const song_Time = new Song(14, "Time Song", "timesong").SetCategory("Tool Song");
const song_Storm = new Song(15, "Storm Song", "stormsong").SetCategory("Tool Song");

const song_Scarecrow = new Song(139, "Scarecrow Song", "scarecrowsong", "Disable").SetCategory("Tool Song");

//Songs (Teleport)
const song_Minuet = new Song(16, "Minuet of Forest", "minuet").SetCategory("Teleport Song");
const song_Bolero = new Song(17, "Bolero of Fire", "bolero").SetCategory("Teleport Song");
const song_Serenade = new Song(18, "Serenade of Water", "serenade").SetCategory("Teleport Song");
const song_Nocturne = new Song(19, "Nocturne of Shadow", "nocturne").SetCategory("Teleport Song");
const song_Requiem = new Song(20, "Requiem of Spirit", "requiem").SetCategory("Teleport Song");
const song_Prelude = new Song(21, "Prelude of Light", "prelude").SetCategory("Teleport Song");

//Miscellaneous
const item_Beans = new Item(22, "Magic Beans", "beans", "Disable").SetCategory("Miscellaneous");
const item_SoA = new Item(23, "Stone of Agony", "stoneagony").SetCategory("Miscellaneous").SetUnique();
const item_IceTrap = new Item(24, "Ice Trap", "icetrap").SetCategory("Miscellaneous");
const item_MemberCard = new Item(140, "Gerudo Membership Card", "membercard").SetCategory("Miscellaneous");

//Swords
const item_KokiriSword = new Item(25, "Kokiri Sword", "kokirisword").SetCategory("Swords").SetUnique();
const item_MasterSword = new Item(26, "Master Sword", "mastersword", "Disable").SetCategory("Swords").SetUnique();
const item_BGS = new Item(27, "Biggoron Sword", "bgs").SetCategory("Swords").SetUnique();

//Shields
const item_DekuShield = new Item(28, "Deku Shield", "dekushield").SetCategory("Shields");
const item_HylianShield = new Item(29, "Hylian Shield", "hylianshield").SetCategory("Shields");
const item_MirrorShield	 = new Item(30, "Mirror Shield", "mirrorshield").SetCategory("Shields").SetUnique();

//Tunics
const item_KokiriTunic = new Item(31, "Kokiri Tunic", "kokiritunic", "Disable").SetCategory("Tunics").SetUnique();
const item_GoronTunic = new Item(32, "Goron Tunic", "gorontunic").SetCategory("Tunics").SetUnique();
const item_ZoraTunic = new Item(33, "Zora Tunic", "zoratunic").SetCategory("Tunics").SetUnique();

//Boots
const item_Boots = new Item(34, "Boots", "boots", "Disable").SetCategory("Boots").SetUnique();
const item_IronBoots = new Item(35, "Iron Boots", "ironboots").SetCategory("Boots").SetUnique();
const item_HoverBoots = new Item(36, "Hover Boots", "hoverboots").SetCategory("Boots").SetUnique();

//Bottles
const item_EmptyBottle = new Item(37, "Empty Bottle", "bottle").SetCategory("Bottles");
const item_SmallPoe = new Item(38, "Small Poe", "smallpoe").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);
const item_BigPoe = new Item(39, "Big Poe", "bigpoe").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);
const item_FairyBottle = new Item(40, "Fairy in a Bottle", "bottlefairy").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);
const item_FishBottle = new Item(41, "Fish in a Bottle", "bottlefish").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);
const item_InsectBottle = new Item(42, "Insects in a Bottle", "bottleinsect").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);
const item_MilkBottle = new Item(43, "Milk Bottle", "bottlemilk").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);
const item_BlueFlame = new Item(44, "Blue Flame Bottle", "blueflame").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);
const item_GreenPotion = new Item(45, "Green Potion", "bottlegreen").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);
const item_BluePotion = new Item(46, "Blue Potion", "bottleblue").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);
const item_RedPotion = new Item(47, "Red Potion", "bottlered").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);

const item_RutoLetter = new Item(48, "Rutos Letter", "rutoletter").SetCategory("Bottles").SetParent(item_EmptyBottle).SetItemType(item_EmptyBottle);

//Tools
const item_Bow1 = new Item(49, "Bow (30)", "bow1").SetCategory("Tools").SetUnique();
const item_Bow2 = new Item(50, "Bow (40)", "bow2").SetCategory("Tools").SetUnique().SetParent(item_Bow1); item_Bow1.SetChild(item_Bow2);
const item_Bow3 = new Item(51, "Bow (50)", "bow3").SetCategory("Tools").SetUnique().SetParent(item_Bow2); item_Bow2.SetChild(item_Bow3);

const item_BombBag1 = new Item(52, "Bomb Bag (20)", "bombbag1").SetCategory("Tools").SetUnique();
const item_BombBag2 = new Item(53, "Bomb Bag (30)", "bombbag2").SetCategory("Tools").SetUnique().SetParent(item_BombBag1); item_BombBag1.SetChild(item_BombBag2);
const item_BombBag3 = new Item(54, "Bomb Bag (40)", "bombbag3").SetCategory("Tools").SetUnique().SetParent(item_BombBag2); item_BombBag2.SetChild(item_BombBag3);

const item_Strength1 = new Item(55, "Goron Bracelets (Strength #1)", "force1").SetCategory("Tools").SetUnique();
const item_Strength2 = new Item(56, "Silver Gauntlets (Strength #2)", "force2").SetCategory("Tools").SetUnique().SetParent(item_Strength1); item_Strength1.SetChild(item_Strength2);
const item_Strength3 = new Item(57, "Golden Gauntlets (Strength #3)", "force3").SetCategory("Tools").SetUnique().SetParent(item_Strength2); item_Strength2.SetChild(item_Strength3);

const item_Slingshot1 = new Item(58, "Slingshot (30)", "slingshot1").SetCategory("Tools").SetUnique();
const item_Slingshot2 = new Item(59, "Slingshot (40)", "slingshot2").SetCategory("Tools").SetUnique().SetParent(item_Slingshot1); item_Slingshot1.SetChild(item_Slingshot2);
const item_Slingshot3 = new Item(60, "Slingshot (50)", "slingshot3").SetCategory("Tools").SetUnique().SetParent(item_Slingshot2); item_Slingshot2.SetChild(item_Slingshot3);

const item_NutsUpgrade1 = new Item(61, "Deku Nuts (30)", "nutsupgrade1").SetCategory("Tools").SetUnique();
const item_NutsUpgrade2 = new Item(62, "Deku Nuts (40)", "nutsupgrade2").SetCategory("Tools").SetUnique().SetParent(item_NutsUpgrade1); item_NutsUpgrade1.SetChild(item_NutsUpgrade2);

const item_SticksUpgrade1 = new Item(63, "Deku Sticks (20)", "stickupgrade1").SetCategory("Tools").SetUnique();
const item_SticksUpgrade2 = new Item(64, "Deku Sticks (30)", "stickupgrade2").SetCategory("Tools").SetUnique().SetParent(item_SticksUpgrade1); item_SticksUpgrade1.SetChild(item_SticksUpgrade2);

const item_Scale1 = new Item(65, "Scale", "scale1").SetCategory("Tools").SetUnique();
const item_Scale2 = new Item(66, "Golden Scale", "scale2").SetCategory("Tools").SetUnique().SetParent(item_Scale1); item_Scale1.SetChild(item_Scale2);

const item_Hookshot = new Item(67, "Hookshot", "hookshot").SetCategory("Tools").SetUnique();
const item_Longshot = new Item(68, "Longshot", "longshot").SetCategory("Tools").SetUnique().SetParent(item_Hookshot); item_Hookshot.SetChild(item_Longshot);

const item_Magic1 = new Item(69, "Magic", "magic1").SetCategory("Tools").SetUnique();
const item_Magic2 = new Item(70, "Double Magic", "magic2").SetCategory("Tools").SetUnique().SetParent(item_Magic1); item_Magic1.SetChild(item_Magic2);

const item_Wallet1 = new Item(71, "Wallet (200)", "wallet1").SetCategory("Tools").SetUnique();
const item_Wallet2 = new Item(72, "Wallet (500)", "wallet2").SetCategory("Tools").SetUnique().SetParent(item_Wallet1); item_Wallet1.SetChild(item_Wallet2);
const item_Wallet3 = new Item(73, "Wallet (999)", "wallet3").SetCategory("Tools").SetUnique().SetParent(item_Wallet2); item_Wallet2.SetChild(item_Wallet3);

const item_Boomerang = new Item(74, "Boomerang", "boomerang").SetCategory("Tools").SetUnique();
const item_Hammer = new Item(75, "Megaton Hammer", "hammer").SetCategory("Tools").SetUnique();
const item_Lens = new Item(76, "Lens of Truth", "lens").SetCategory("Tools").SetUnique();

//Collectible
const item_Bombs = new Item(77, "Bomb", "bomb").SetCategory("Collectible").SetRequiredItems(item_BombBag1);
const item_Seeds = new Item(78, "Deku Seeds", "dekuseed").SetCategory("Collectible").SetRequiredItems(item_Slingshot1);
const item_Arrows = new Item(79, "Arrow Bundle", "arrow").SetCategory("Collectible").SetRequiredItems(item_Bow1);

const item_Bombchus = new Item(80, "Bombchu", "bombchu").SetCategory("Collectible");
const item_Nuts = new Item(81, "Deku Nuts", "nuts").SetCategory("Collectible");
const item_Sticks = new Item(82, "Deku Stick", "stick").SetCategory("Collectible");
const item_Hearts = new Item(83, "Recovery Heart", "heart").SetCategory("Collectible");

//Fairies Magic
const item_Din = new Item(84, "Din's Fire", "din").SetCategory("Fairies Magic").SetUnique();
const item_Farore = new Item(85, "Farores's Wind", "farore").SetCategory("Fairies Magic").SetUnique();
const item_Nayru = new Item(86, "Nayru's Love", "nayru").SetCategory("Fairies Magic").SetUnique();
const item_DoubleDefense = new Item(87, "Double Defense", "doubledefense").SetCategory("Fairies Magic").SetUnique();

//Bow Magic
const item_FireArrow = new Item(88, "Fire Arrow", "firearrow").SetCategory("Bow Magic").SetUnique();
const item_IceArrow = new Item(89, "Ice Arrow", "icearrow").SetCategory("Bow Magic").SetUnique();
const item_LightArrow = new Item(90, "Light Arrow", "lightarrow").SetCategory("Bow Magic").SetUnique();

//Hearts
const item_PoH = new Item(91, "Piece of Heart", "pieceheart").SetCategory("Heart");
const item_HeartContainer = new Item(92, "Heart Container", "fullheart").SetCategory("Heart");

//Rupees
const item_Rupee1 = new Item(93, "Green Rupee (1)", "rupee1").SetCategory("Rupee").SetUnique();
const item_Rupee5 = new Item(94, "Blue Rupee (5)", "rupee2").SetCategory("Rupee");
const item_Rupee20 = new Item(95, "Red Rupee (20)", "rupee3").SetCategory("Rupee");
const item_Rupee50 = new Item(96, "Purple Rupee (50)", "rupee4").SetCategory("Rupee");
const item_Rupee200 = new Item(97, "Yellow Rupee (200)", "rupee5").SetCategory("Rupee");

//Special
const item_Skulltula = new Item(98, "Golden Skulltula", "goldenskull", "Skulltulas").SetCategory("Useless").SetUnique();

//Mask Quest
const item_Mask1 = new Item(99, "Egg (Child)", "egg").SetCategory("Mask Quest").SetUnique();
const item_Mask2 = new Item(100, "Chicken (Child)", "chicken").SetCategory("Mask Quest").SetParent(item_Mask1).SetUnique();  item_Mask1.SetChild(item_Mask2);
const item_Mask3 = new Item(101, "Zelda's Letter", "zeldaletter").SetCategory("Mask Quest").SetParent(item_Mask2).SetUnique();  item_Mask2.SetChild(item_Mask3);
const item_Mask4 = new Item(102, "Keaton Mask", "keatonmask").SetCategory("Mask Quest").SetParent(item_Mask3).SetUnique();  item_Mask3.SetChild(item_Mask4);
const item_Mask5 = new Item(103, "Skull Mask", "skullmask").SetCategory("Mask Quest").SetParent(item_Mask4).SetUnique();  item_Mask4.SetChild(item_Mask5);
const item_Mask6 = new Item(104, "Redead Mask", "redeadmask").SetCategory("Mask Quest").SetParent(item_Mask5).SetUnique();  item_Mask5.SetChild(item_Mask6);
const item_Mask7 = new Item(105, "Bunny Mask", "bunnymask").SetCategory("Mask Quest").SetParent(item_Mask6).SetUnique();  item_Mask6.SetChild(item_Mask7);
const item_Mask8 = new Item(106, "Goron Mask", "goronmask").SetCategory("Mask Quest").SetParent(item_Mask7).SetUnique();  item_Mask7.SetChild(item_Mask8);
const item_Mask9 = new Item(107, "Zora Mask", "zoramask").SetCategory("Mask Quest").SetParent(item_Mask8).SetUnique();  item_Mask8.SetChild(item_Mask9);
const item_Mask10 = new Item(108, "Gerudo Mask", "gerudomask").SetCategory("Mask Quest").SetParent(item_Mask9).SetUnique();  item_Mask9.SetChild(item_Mask10);
const item_Mask11 = new Item(109, "Mask of Truth", "truthmask").SetCategory("Mask Quest").SetParent(item_Mask10).SetUnique();  item_Mask10.SetChild(item_Mask11);

//BGS Quest
const item_BGS1 = new Item(110, "Egg (Adult)", "egg").SetCategory("BGS Quest").SetUnique();
const item_BGS2 = new Item(111, "Chicken (Adult)", "chicken").SetCategory("BGS Quest").SetParent(item_BGS1).SetUnique();  item_BGS1.SetChild(item_BGS2);
const item_BGS3 = new Item(112, "Cojiro", "cojiro").SetCategory("BGS Quest").SetParent(item_BGS2).SetUnique();  item_BGS2.SetChild(item_BGS3);
const item_BGS4 = new Item(113, "Odd Mushroom", "oddmushroom").SetCategory("BGS Quest").SetParent(item_BGS3).SetUnique();  item_BGS3.SetChild(item_BGS4);
const item_BGS5 = new Item(114, "Odd Potion", "oddpotion").SetCategory("BGS Quest").SetParent(item_BGS4).SetUnique();  item_BGS4.SetChild(item_BGS5);
const item_BGS6 = new Item(115, "Poachers Saw", "poachersaw").SetCategory("BGS Quest").SetParent(item_BGS5).SetUnique();  item_BGS5.SetChild(item_BGS6);
const item_BGS7 = new Item(116, "Broken BGS", "brokenbgs").SetCategory("BGS Quest").SetParent(item_BGS6).SetUnique();  item_BGS6.SetChild(item_BGS7);
const item_BGS8 = new Item(117, "Prescription", "prescription").SetCategory("BGS Quest").SetParent(item_BGS7).SetUnique();  item_BGS7.SetChild(item_BGS8);
const item_BGS9 = new Item(118, "Eyeball Frog", "eyeballfrog").SetCategory("BGS Quest").SetParent(item_BGS8).SetUnique();  item_BGS8.SetChild(item_BGS9);
const item_BGS10 = new Item(119, "Eye Drops", "eyedrops").SetCategory("BGS Quest").SetParent(item_BGS9).SetUnique();  item_BGS9.SetChild(item_BGS10);
const item_BGS11 = new Item(120, "Claim Check", "claimcheck").SetCategory("BGS Quest").SetParent(item_BGS10).SetUnique();  item_BGS10.SetChild(item_BGS11);

//Ocarinas
const item_Ocarina1 = new Item(121, "Fairy Ocarina", "ocarinasaria", "Disable").SetCategory("Ocarina").SetUnique();
const item_Ocarina2 = new Item(122, "Ocarina of Time", "ocarinatime", "Disable").SetCategory("Ocarina").SetUnique().SetParent(item_Ocarina1); item_Ocarina1.SetChild(item_Ocarina2);

//=====ZONE GROUPS=====
const group_Forest = new ZoneGroup("#428257", "#194929");
const group_Fire = new ZoneGroup("#d6746b", "#a03e35");
const group_Field = new ZoneGroup("#75b74d", "#4d6d3a");
const group_Zora = new ZoneGroup("#4dbfd1", "#2b7f8c");
const group_Castle = new ZoneGroup("#999999", "#666666");
const group_Lake = new ZoneGroup("#437ce8", "#1f4da5");
const group_Kakariko = new ZoneGroup("#e386e8", "#a851ad");
const group_Desert = new ZoneGroup("#eab95d", "#a87d2b");
const group_Current = new ZoneGroup("#6c5565", "#3d273b");


//=====ZONES=====
//Forest
const zone_KokiriForest = new Zone(group_Forest, "Kokiri Forest", "kokiri");
const zone_SacredForestMeadow = new Zone(group_Forest, "Sacred Forest Meadow", "sfm");
const zone_LostWood = new Zone(group_Forest, "Lost Wood", "lw");

//Fire
const zone_DMT = new Zone(group_Fire, "Death Montain Trail", "dmt");
const zone_DMC = new Zone(group_Fire, "Death Montain Crater", "dmc");
const zone_GC = new Zone(group_Fire, "Goron City", "gc");

//Field
const zone_HyruleField = new Zone(group_Field, "Hyrule Field", "field");
const zone_LonLonRanch = new Zone(group_Field, "Lon Lon Ranch", "ranch");

//Zora
const zone_ZoraRiver = new Zone(group_Zora, "Zora's River", "river");
const zone_ZoraDomain = new Zone(group_Zora, "Zora's Domain", "domain");
const zone_ZoraFountain = new Zone(group_Zora, "Zora's Fountain", "zf");

//Castle
const zone_Market = new Zone(group_Castle, "Market", "market");
const zone_HyruleCastle = new Zone(group_Castle, "Hyrule's Castle", "hc");
const zone_TempleOfTime = new Zone(group_Castle, "Temple of Time", "tot");
const zone_OutsideGanon = new Zone(group_Castle, "Outside Ganon's Castle", "outGanon");

//Lake
const zone_LakeHylia = new Zone(group_Lake, "Lake Hylia", "lh");

//Kakariko
const zone_Kakariko = new Zone(group_Kakariko, "Kakariko Village", "kak");
const zone_Graveyard = new Zone(group_Kakariko, "Graveyard", "graveyard");

//Desert
const zone_Valley = new Zone(group_Desert, "Gerudo Valley", "valley");
const zone_Fortress = new Zone(group_Desert, "Gerudo Fortress", "fortress");
const zone_Wasteland = new Zone(group_Desert, "Haunted Wasteland", "wasteland");
const zone_Colossus = new Zone(group_Desert, "Desert Colossus", "colossus");

const zone_CurrentStat = new Zone(group_Current, "Currents Items", "currentItems").SetCanHaveHint(false);

//=====DUNGEONS=====
//Dungeons (Child)
const dun_Deku = new Dungeon(group_Forest, "Deku Tree", "deku").SetKeyRequired(0);
const dun_DC = new Dungeon(group_Fire, "Dodongo Cavern", "dc").SetKeyRequired(0)
    .SetEnteringZoneLogic(function () { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Hammer, item_Strength1])});
const dun_Jabu = new Dungeon(group_Zora, "Jabu-Jabu Cavern", "jabu").SetKeyRequired(0).SetAgeRequired(1)
    .SetEnteringZoneLogic(function () { return DoesHaveThoseItems([item_RutoLetter])
        && (DoesHaveAnyOfThoseItems([item_BombBag1, song_Zelda]
            || DoesHaveThoseItems([item_Scale1])))});

//Optionnals
const dun_IceCavern = new Dungeon(group_Zora, "Ice Cavern", "iceCavern").SetKeyRequired(0).SetAgeRequired(2)
    .SetEnteringZoneLogic(function () { return DoesHaveThoseItems([item_RutoLetter, song_Zelda])
    && DoesHaveAnyOfThoseItems([item_BombBag1, item_Scale1]);});
const dun_BotW = new Dungeon(group_Kakariko, "Bottom of the Well", "botw").SetKeyRequired(3).SetAgeRequired(1)
    .SetEnteringZoneLogic(function () { return DoesHaveThoseItems([song_Storm])});
const dun_GTG = new Dungeon(group_Desert, "Gerudo Training Ground", "gtg").SetKeyRequired(9).SetAgeRequired(2)
    .SetEnteringZoneLogic(function () { return SubLogic_GerudoFortressAccess()
    && SubLogic_CarpenterRescueAccess()
    && DoesHaveThoseItems([item_MemberCard])});

//Dungeons (Adult)
const dun_Forest = new Dungeon(group_Forest, "Forest Temple", "forest").SetKeyRequired(5).SetAgeRequired(2).SetBossKeyRequired()
    .SetEnteringZoneLogic(function () { return DoesHaveAnyOfThoseItems([song_Saria, song_Minuet])
    && DoesHaveThoseItems([item_Hookshot])});
const dun_Fire = new Dungeon(group_Fire, "Fire Temple", "fire").SetKeyRequired(8).SetAgeRequired(2).SetBossKeyRequired()
    .SetEnteringZoneLogic(function () { return SubLogic_GoronTunicAccess()
        && (DoesHaveThoseItems([song_Bolero])
            || (DoesHaveAnyOfThoseItems([item_BombBag1, item_Hammer])
                && DoesHaveAnyOfThoseItems([item_Longshot, item_HoverBoots]))
            || (DoesHaveAnyOfThoseItems([item_Bow1, item_BombBag1, item_Strength1])
                && DoesHaveAnyOfThoseItems([item_Hookshot, item_HoverBoots])))});
const dun_Water = new Dungeon(group_Lake, "Water Temple", "water").SetKeyRequired(6).SetAgeRequired(2).SetBossKeyRequired()
    .SetEnteringZoneLogic(function () { return SubLogic_GoronTunicAccess()
    && DoesHaveThoseItems([item_IronBoots, item_Hookshot]);});
const dun_Shadow = new Dungeon(group_Kakariko, "Shadow Temple", "shadow").SetKeyRequired(5).SetAgeRequired(2).SetBossKeyRequired()
    .SetEnteringZoneLogic(function () { return DoesHaveThoseItems([song_Nocturne, item_Din])
        && DoesHaveAnyOfThoseItems([item_HoverBoots, item_Hookshot])
        && SubLogic_LensOfTruth()});
const dun_Spirit = new Dungeon(group_Desert, "Spirit Temple", "spirit").SetKeyRequired(5).SetAgeRequired(2).SetBossKeyRequired()
    .SetEnteringZoneLogic(function () { return DoesHaveThoseItems([song_Requiem])
        || (SubLogic_GerudoFortressAccess()
            && DoesHaveAnyOfThoseItems([item_HoverBoots, item_Longshot])
            && SubLogic_LensOfTruth());});

//Final Dungeon
const dun_Ganon = new Dungeon(group_Castle, "Ganon's Castle", "ganon").SetKeyRequired(2).SetAgeRequired(2).SetBossKeyRequired()
    .SetEnteringZoneLogic(function () { return SubLogic_GanonCastleAccess();});

//Dungeons Items
const item_keyForest = new ItemKey(123, "Key (Forest)", "keyforest", dun_Forest).SetCategory("Dungeon Stuff");
const item_keyFire = new ItemKey(124, "Key (Fire)", "keyfire", dun_Fire).SetCategory("Dungeon Stuff");
const item_keyWater = new ItemKey(125, "Key (Water)", "keywater", dun_Water).SetCategory("Dungeon Stuff");
const item_keyShadow = new ItemKey(126, "Key (Shadow)", "keyshadow", dun_Shadow).SetCategory("Dungeon Stuff");
const item_keySpirit = new ItemKey(127, "Key (Spirit)", "keyspirit", dun_Spirit).SetCategory("Dungeon Stuff");
const item_keyBotW = new ItemKey(128, "Key (BotW)", "keybotw", dun_BotW).SetCategory("Dungeon Stuff");
const item_keyGTG = new ItemKey(129, "Key (GTG)", "keygtg", dun_GTG).SetCategory("Dungeon Stuff");
const item_keyGanon = new ItemKey(130, "Key (Ganon)", "keyganon", dun_Ganon).SetCategory("Dungeon Stuff");

const item_bosskeyForest = new ItemBossKey(131, "Boss Key (Forest)", "bosskeyforest", dun_Forest).SetCategory("Dungeon Stuff");
const item_bosskeyFire = new ItemBossKey(132, "Boss Key (Fire)", "bosskeyfire", dun_Fire).SetCategory("Dungeon Stuff");
const item_bosskeyWater = new ItemBossKey(133, "Boss Key (Water)", "bosskeywater", dun_Water).SetCategory("Dungeon Stuff");
const item_bosskeyShadow = new ItemBossKey(134, "Boss Key (Shadow)", "bosskeyshadow", dun_Shadow).SetCategory("Dungeon Stuff");
const item_bosskeySpirit = new ItemBossKey(135, "Boss Key (Spirit)", "bosskeyspirit", dun_Spirit).SetCategory("Dungeon Stuff");
const item_bosskeyGanon = new ItemBossKey(136, "Boss Key (Ganon)", "bosskeyganon", dun_Ganon).SetCategory("Dungeon Stuff");

const item_map = new Item(137, "Map", "map", 'Dungeons').SetCategory("Dungeon Stuff");
const item_compass = new Item(138, "Compass", "compass", 'Dungeons').SetCategory("Dungeon Stuff");

//=====CHECKS=====
//Forest
const check_Current_Scarecrow = new CheckStat("currentScarecrow", "Current Scarecrow", zone_CurrentStat, function (i) {
	return i === item_UnknownItem || i === song_Scarecrow;
});
const check_Current_Bean = new CheckStat("currentBean", "Current Bean", zone_CurrentStat, function (i) {
	return i === item_UnknownItem || i === item_Beans;
});
const check_Current_Mask = new CheckStat("currentMask", "Current Mask Quest", zone_CurrentStat, function (i) {
	return i === item_UnknownItem || i._category === item_Mask1._category;
});
	const check_Current_BGS = new CheckStat("currentBGS", "Current BGS Quest", zone_CurrentStat, function (i) {
	return i === item_UnknownItem || i._category === item_BGS1._category;
});
	const check_Current_Stone = new Check("currentStone", "Starting Medaillon", zone_CurrentStat).SetCheckType(2);

//Forest
const check_KokiriSword = new Check("kokiriSword", "Kokiri Sword", zone_KokiriForest);
const check_KokiriMido1 = new Check("kokiriMido1", "Mido's House (Top Left)", zone_KokiriForest);
const check_KokiriMido2 = new Check("kokiriMido2", "Mido's House (Top Right)", zone_KokiriForest);
const check_KokiriMido3= new Check("kokiriMido3", "Mido's House (Bottom Left)", zone_KokiriForest);
const check_KokiriMido4 = new Check("kokiriMido4", "Mido's House (Bottom Right)", zone_KokiriForest);
    const check_KokiriSoS = new Check("kokiriSoS", "SoS Grotto", zone_KokiriForest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Storm]); });

const check_SFMGrotto = new Check("sfmGrotto", "Wolf Grotto", zone_SacredForestMeadow)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_BombBag1])
        || (DoesHaveThoseItems([item_Hammer]) && DoesHaveAnyOfThoseItems([song_Saria, song_Minuet])); });
const check_SFMSaria = new Check("sfmSaria", "Saria's Song", zone_SacredForestMeadow).SetCheckType(1)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Mask3]); });
const check_SFMMinuet = new Check("sfmMinuet", "Minuet of Forest", zone_SacredForestMeadow).SetCheckType(1)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([song_Saria, song_Minuet]); });

const check_LWSaria = new Check("lwSaria", "Saria on Bridge", zone_LostWood).SetItem(item_Ocarina1, true).SetLockedState(2, true).SetHintState(true, true);
const check_LWScrub = new Check("lwScrub", "Scrub under Bridge", zone_LostWood);
const check_LWSkullKid = new Check("lwSkullKid", "Skull Kid", zone_LostWood)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Saria]); });
const check_LWSlingshot = new Check("lwSlingshot", "Slingshot Target", zone_LostWood)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Slingshot1]); });
const check_LWOcarina = new Check("lwOcarina", "Ocarina Game", zone_LostWood)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Ocarina1]); });
const check_LWGrottoGC = new Check("lwGrottoGC", "Grotto near Goron City", zone_LostWood)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Hammer]); });
const check_LWGrottoSFM = new Check("lwGrottoSFM", "Grotto near Sacred Forest Meadow", zone_LostWood)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_BombBag1])
        || (DoesHaveThoseItems([item_Hammer]) && DoesHaveAnyOfThoseItems([song_Saria, song_Minuet])); });
const check_LWSkullMask = new Check("lwSkullMask", "Skull Mask Reward", zone_LostWood)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Mask5]); });

const check_DekuMap = new Check("dekuMap", "Map", dun_Deku);
const check_DekuSlingshot = new Check("dekuSlingshot", "Slingshot", dun_Deku);
const check_DekuNearSlingshot = new Check("dekuNearSlingshot", "Near Slingshot", dun_Deku);
const check_DekuCompass = new Check("dekuCompass", "Compass", dun_Deku);
const check_DekuNearCompass = new Check("dekuNearCompass", "Near Compass", dun_Deku);
const check_DekuBasement = new Check("dekuBasement", "Basement", dun_Deku);
const check_DekuGohma = new Check("dekuGohma", "Queen Gohma", dun_Deku)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Slingshot1]); });
const check_DekuStone = new Check("dekuStone", "Stone/Medaillon", dun_Deku).SetCheckType(2)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Slingshot1]); });

const check_ForestFirst = new Check("forestFirst", "First Room", dun_Forest);
const check_ForestStalfos = new Check("forestStalfos", "Stalfos Fight", dun_Forest);
const check_ForestMap = new Check("forestMap", "Map Chest", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Time])
        && (DoesHaveThoseItems([item_Bow1])
            && DoesHaveAnyOfThoseItems([item_IronBoots, item_Scale2, item_Longshot]))
        || DoesHaveThoseItems([item_keyForest, item_HoverBoots])
        || DoesHaveThoseItems([item_Strength1, item_Bow1, item_keyForest, item_keyForest]);});
const check_ForestScarecrow = new Check("forestScarecrow", "Bellow Scarecrow", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Time])
        && DoesHaveThoseItems([item_Bow1])
        || DoesHaveThoseItems([item_keyForest, item_HoverBoots]);});
const check_ForestWell = new Check("forestWell", "Well", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Time])
        && (DoesHaveThoseItems([item_Bow1])
            && DoesHaveAnyOfThoseItems([item_IronBoots, item_Scale2, item_Longshot]))
        || DoesHaveThoseItems([item_keyForest, item_HoverBoots])
        || DoesHaveThoseItems([item_Strength1, item_Bow1, item_keyForest, item_keyForest]);});
const check_ForestFloormaster = new Check("forestFloormaster", "Floormaster", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1, item_HoverBoots])
        || DoesHaveThoseItems([item_Bow1, item_Strength1, item_keyForest, item_keyForest]);});
const check_ForestBlocks = new Check("forestBlocks", "Block Room Eye", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1, item_Strength1, item_keyForest]);});
const check_ForestBK = new Check("forestBK", "Boss Key", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1, item_Strength1, item_keyForest, item_keyForest]);});
const check_ForestRedPoe = new Check("forestRedPoe", "Red Poe", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1, item_Strength1, item_keyForest, item_keyForest, item_keyForest]);});
const check_ForestBow = new Check("forestBow", "Bow Chest", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Strength1, item_keyForest, item_keyForest, item_keyForest]);});
const check_ForestBluePoe = new Check("forestBluePoe", "Blue Poe", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1, item_Strength1, item_keyForest, item_keyForest, item_keyForest]);});
const check_ForestCheckboard = new Check("forestCheckboard", "Checkboard (aka. Plafonbro)", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Strength1, item_keyForest, item_keyForest, item_keyForest, item_keyForest, item_keyForest])
        || DoesHaveAnyOfThoseItems([item_Bow1, item_Din]);});
const check_ForestBasement = new Check("forestBasement", "Basement", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1, item_Strength1, item_keyForest, item_keyForest, item_keyForest, item_keyForest, item_keyForest]);});
const check_ForestGanon = new Check("forestGanon", "Phantom Ganon", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1, item_Strength1, item_keyForest, item_keyForest, item_keyForest, item_keyForest, item_keyForest, item_bosskeyForest]);});
const check_ForestStone = new Check("forestStone", "Stone/Medaillon", dun_Forest)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1, item_Strength1, item_keyForest, item_keyForest, item_keyForest, item_keyForest, item_keyForest, item_bosskeyForest]);});

//Fire
const check_DMTAboveDC = new Check("dmtAboveDC", "Heart above DC", zone_DMT);
const check_DMTWall = new Check("dmtWall", "Chest behind Wall", zone_DMT)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Hammer]); });
const check_DMTGrotto = new Check("dmtGrotto", "SoS Grotto", zone_DMT)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Storm]); });
const check_DMTFairy = new Check("dmtFairy", "Magic Fairy", zone_DMT)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Zelda])
        && DoesHaveAnyOfThoseItems([item_BombBag1, item_Hammer]); });
const check_DMTBiggoron = new Check("dmtBiggoron", "Biggoron", zone_DMT)
    .SetLogicValidator(function() { return (DoesHaveThoseItems([item_Strength1, item_BombBag1, item_Hammer]) || (DoesHaveThoseItems[song_Bolero]
        && DoesHaveAnyOfThoseItems([item_HoverBoots, item_Hookshot, item_Beans]))) &&
        (DoesHaveThoseItems([item_BGS8]) && IsCheckInLogic(check_ZDKZ))
        || DoesHaveThoseItems([item_BGS11])});

const check_DMCWall = new Check("dmcWall", "Wall Heart", zone_DMC)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Strength1, item_BombBag1, item_Bow1])
        || (DoesHaveThoseItems([song_Bolero]) && DoesHaveAnyOfThoseItems([item_HoverBoots, item_Hookshot, item_Beans])); });
const check_DMCVolcano = new Check("dmcVolcano", "Volcano Heart", zone_DMC)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Beans, song_Bolero]); });
const check_DMCFairy = new Check("dmcFairy", "Double Magic Fairy", zone_DMC)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Epona, item_Hammer])
        && (DoesHaveAnyOfThoseItems([item_Strength1, item_BombBag1, item_Bow1])
        || (DoesHaveThoseItems([song_Bolero]) && DoesHaveAnyOfThoseItems([item_HoverBoots, item_Hookshot]))
        || DoesHaveThoseItems([item_HoverBoots])); });
const check_DMCGrotto = new Check("dmcGrotto", "Grotto", zone_DMC)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Hammer, item_BombBag1]); });
const check_DMCBolero = new Check("dmcBolero", "Bolero of Fire", zone_DMC).SetCheckType(1)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems[song_Bolero]
            || (DoesHaveAnyOfThoseItems([item_Strength1, item_BombBag1, item_Bow1]) && DoesHaveAnyOfThoseItems([item_HoverBoots, item_Hookshot]))
            || (DoesHaveAnyOfThoseItems([item_BombBag1, item_Hammer]) && (DoesHaveAnyOfThoseItems([item_Longshot, song_Scarecrow]) || DoesHaveThoseItems([item_HoverBoots])))
    });

const check_GCDarunia = new Check("gcDarunia", "Darunia", zone_GC)
	.SetLogicValidator(function() { return DoesHaveThoseItems([song_Zelda, song_Saria]); });
const check_GCPot = new Check("gcPot", "Spining Pot", zone_GC)
	.SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([song_Zelda, item_Din])
		&& DoesHaveAnyOfThoseItems([item_Strength1, item_BombBag1]); });
const check_GCHotRod = new Check("gcHotRod", "Hot Rod Goron", zone_GC)
	.SetLogicValidator(function() { return DoesHaveThoseItems([item_BombBag1]); });
const check_GCLink = new Check("gcLink", "Link the Goron", zone_GC)
	.SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Strength1, item_Bow1]); });
const check_GCBoulderL = new Check("gcBoulderL", "Boulder Maze (Bomb Way Left)", zone_GC)
	.SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Hammer, item_Strength2]); });
const check_GCBoulderR = new Check("gcBoulderR", "Boulder Maze (Bomb Way Right)", zone_GC)
	.SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Hammer, item_Strength2]); });
const check_GCBoulderH = new Check("gcBoulderH", "Boulder Maze (Strength/Hammer)", zone_GC)
	.SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Hammer, item_Strength2]); });

const check_DCMap = new Check("dcMap", "Map", dun_DC);
const check_DCCompass = new Check("dcCompass", "Compass", dun_DC);
const check_DCPlatform = new Check("dcPlatform", "Platform Chest", dun_DC)
    .SetLogicValidator(function () { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Strength1, item_Din, item_Bow1]); });
const check_DCBomb = new Check("dcBomb", "Bomb Bag Chest", dun_DC)
    .SetLogicValidator(function () { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Strength1, item_Din, item_Bow1])
        && DoesHaveAnyOfThoseItems([item_Slingshot1, item_Bow1, item_HoverBoots, item_Longshot]); });
const check_DCBridge = new Check("dcBridge", "End of Bridge", dun_DC)
    .SetLogicValidator(function () { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Strength1, item_Din, item_Bow1])
        && DoesHaveAnyOfThoseItems([item_Slingshot1, item_Bow1, item_HoverBoots, item_Longshot])
        && (DoesHaveThoseItems([item_BombBag1])
            || (DoesHaveThoseItems([item_Hammer])
                && DoesHaveAnyOfThoseItems([item_Bow1, item_HoverBoots, item_Longshot]))); });
const check_DCBoss = new Check("dcBoss", "Above Boss", dun_DC)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_BombBag1])
        && DoesHaveAnyOfThoseItems([item_Slingshot1, item_Bow1, item_HoverBoots, item_Longshot]); });
const check_DCKD = new Check("dcKD", "King Dodongo", dun_DC)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_BombBag1])
        && DoesHaveAnyOfThoseItems([item_Slingshot1, item_Bow1, item_HoverBoots, item_Longshot])
        && DoesHaveAnyOfThoseItems([item_BombBag1, item_Strength1]); });
const check_DCStone = new Check("dcStone", "Stone/Medaillon", dun_DC).SetCheckType(2)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_BombBag1])
        && DoesHaveAnyOfThoseItems([item_Slingshot1, item_Bow1, item_HoverBoots, item_Longshot])
        && DoesHaveAnyOfThoseItems([item_BombBag1, item_Strength1]); });

const check_FireBoss = new Check("fireBoss", "Near Boss", dun_Fire);
const check_FireFlare = new Check("fireFlare", "Flare Dancer", dun_Fire)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Hammer]); });
const check_FireBK = new Check("fireBK", "Boss Key", dun_Fire)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Hammer]); });
const check_FireBridgeL = new Check("fireBridgeL", "Bridge Room Left", dun_Fire)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_keyFire]); });
const check_FireBridgeR = new Check("fireBridgeR", "Bridge Room Right", dun_Fire)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_keyFire, item_BombBag1]); });
const check_FireBoulderGoron = new Check("fireBoulderGoron", "Boulder Maze (Goron Cage)", dun_Fire)
    .SetLogicValidator(function () { return SubLogic_FireTemple_EarlyClimb()});
const check_FireBoulderCave = new Check("fireBoulderCave", "Boulder Maze (Goron in Cave)", dun_Fire)
    .SetLogicValidator(function () { return SubLogic_FireTemple_EarlyClimb()});
const check_FireBoulderTop = new Check("fireBoulderTop", "Boulder Maze (Top Goron)", dun_Fire)
    .SetLogicValidator(function () { return SubLogic_FireTemple_EarlyClimb()
        && DoesHaveThoseItems([item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire]);});
const check_FireShortcut = new Check("fireShortcut", "Shortcut Goron", dun_Fire)
    .SetLogicValidator(function () { return SubLogic_FireTemple_EarlyClimb()
        && DoesHaveThoseItems([item_BombBag1, item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire]);});
const check_FireScarecrow = new Check("fireScarecrow", "Scarecrow", dun_Fire)
    .SetLogicValidator(function () { return SubLogic_FireTemple_EarlyClimb()
        && DoesHaveThoseItems([item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_Hookshot, song_Scarecrow]);});
const check_FireMap = new Check("fireMap", "Map", dun_Fire)
    .SetLogicValidator(function () { return SubLogic_FireTemple_EarlyClimb()
        && (DoesHaveThoseItems([item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire])
            || DoesHaveThoseItems([item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_Bow1]));});
const check_FireCompass = new Check("fireCompass", "Compass", dun_Fire)
    .SetLogicValidator(function () { return SubLogic_FireTemple_EarlyClimb()
        && DoesHaveThoseItems([item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire, item_keyFire]);});
const check_FireGoronHammer = new Check("fireGoronHammer", "Goron under Hammer", dun_Fire)
    .SetLogicValidator(function () { return SubLogic_FireTemple_EarlyClimb()
        && SubLogic_FireTemple_FireMazeEscape()
        && DoesHaveThoseItems([song_Time, item_Hammer])});
const check_FireHammer = new Check("fireHammer", "Megaton Hammer", dun_Fire)
    .SetLogicValidator(function () { return SubLogic_FireTemple_EarlyClimb()
        && SubLogic_FireTemple_FireMazeEscape()
        && DoesHaveThoseItems([song_Time, item_Hammer])});
const check_FireVolvagia = new Check("fireVolvagia", "Volvagia", dun_Fire)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Hammer, item_bosskeyFire])
        && (DoesHaveThoseItems([item_HoverBoots])
            || (SubLogic_FireTemple_EarlyClimb() && SubLogic_FireTemple_FireMazeEscape()
                && DoesHaveAnyOfThoseItems([song_Time, item_BombBag1]))); });
const check_FireStone = new Check("fireStone", "Stone/Medaillon", dun_Fire).SetCheckType((2))
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Hammer, item_bosskeyFire])
        && (DoesHaveThoseItems([item_HoverBoots])
            || (SubLogic_FireTemple_EarlyClimb() && SubLogic_FireTemple_FireMazeEscape()
                && DoesHaveAnyOfThoseItems([song_Time, item_BombBag1]))); });

//Field
const check_FieldMarket = new Check("fieldMarket", "Near Market Grotto", zone_HyruleField)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Hammer, item_BombBag1])
    && DoesHaveAnyOfThoseItems([item_Scale2, item_IronBoots]); });
const check_FieldDive = new Check("fieldDive", "Dive Grotto (aka. ATZ Grotto)", zone_HyruleField)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Hammer, item_BombBag1]); });
const check_FieldScrub = new Check("fieldScrub", "Scrub Grotto near Lake", zone_HyruleField)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Hammer, item_BombBag1]); });
const check_FieldOpen = new Check("fieldOpen", "Open Grotto", zone_HyruleField);
const check_FieldSoutheast = new Check("fieldSoutheast", "Grotto Southeast", zone_HyruleField)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Hammer, item_BombBag1]); });
const check_FieldOOTSong = new Check("fieldOOTSong", "Ocarina of Time (Song)", zone_HyruleField).SetCheckType(1)
    .SetLogicValidator(function() { return DoesHaveThoseItems([stone_Emerald, stone_Ruby, stone_Saphir]); });
const check_FieldOOTItem = new Check("fieldOOTItem", "Ocarina of Time (Item)", zone_HyruleField).SetItem(item_Ocarina2, true).SetLockedState(2, true).SetHintState(true, true)
    .SetLogicValidator(function() { return DoesHaveThoseItems([stone_Emerald, stone_Ruby, stone_Saphir]); });

const check_LLCTalon = new Check("llcTalon", "Talon's Cuccos", zone_LonLonRanch)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Mask3]); });
const check_LLCEpona = new Check("llcEpona", "Epona Song", zone_LonLonRanch).SetCheckType(1)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Mask3]); });
const check_LLCHeart = new Check("llcHeart", "Heart Piece", zone_LonLonRanch);

//Zora
const check_ZRPillar = new Check("zrPilar", "Heart Piece (Pilar)", zone_ZoraRiver)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Scale1, item_HoverBoots]); });
const check_ZRDomain = new Check("zrDomain", "Heart Piece (Near Zora Domain)", zone_ZoraRiver)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Scale1, item_HoverBoots]); });
const check_ZRGrotto = new Check("zrGrotto", "Open Grotto", zone_ZoraRiver);
const check_ZRFrogs1 = new Check("zrFrogs1", "Frogs (SoS)", zone_ZoraRiver)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Storm]) && DoesHaveAnyOfThoseItems([item_BombBag1, item_Scale1]); });
const check_ZRFrogs2 = new Check("zrFrogs2", "Frogs (All except SoS)", zone_ZoraRiver)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Saria, song_Zelda, song_Epona, song_Time, song_Sun]) && DoesHaveAnyOfThoseItems([item_BombBag1, item_Scale1]); });

const check_ZDDive = new Check("zdDive", "Dive Minigame", zone_ZoraDomain)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Scale1])
        || DoesHaveThoseItems([item_BombBag1, song_Zelda]); });
const check_ZDTorch = new Check("zdTorch", "Dive Minigame", zone_ZoraDomain)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_BombBag1, song_Zelda])
        || DoesHaveThoseItems([item_Scale1]); });
const check_ZDKZ = new Check("zdKZ", "Dive Minigame", zone_ZoraDomain)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_EmptyBottle, song_Zelda])
        && (DoesHaveThoseItems([item_Wallet2])
            || (DoesHaveThoseItems([item_RutoLetter]) && DoesHaveAnyOfThoseItems([item_BombBag1, item_Scale1]))
            || DoesHaveThoseItems([stone_Forest, stone_Fire, stone_Water, stone_Shadow, stone_Spirit, stone_Light]));});

const check_ZFFairy = new Check("zfFairy", "Farore's Wind Fairy", zone_ZoraFountain)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_BombBag1, item_RutoLetter, song_Zelda]); });
const check_ZFIceberg = new Check("zfIceberg", "Iceberg Heart", zone_ZoraFountain)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_BombBag1, item_Scale1])
        && DoesHaveThoseItems([song_Zelda, item_RutoLetter]); });
const check_ZFBottom = new Check("zfBottom", "Bottom of the Fountain", zone_ZoraFountain)
    .SetLogicValidator(function() { return SubLogic_ZoraTunicAccess()
        && (DoesHaveAnyOfThoseItems([item_BombBag1, item_Scale1])
            && DoesHaveThoseItems([song_Zelda, item_RutoLetter, item_IronBoots])); });

const check_JabuBoomerang = new Check("jabuBoomerang", "Boomerang", dun_Jabu)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Slingshot1, item_BombBag1, item_Boomerang]); });
const check_JabuMap = new Check("jabuMap", "Map", dun_Jabu)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Boomerang]); });
const check_JabuCompass = new Check("jabuCompass", "Compass", dun_Jabu)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Boomerang]); });
const check_JabuBarinade = new Check("jabuBarinade", "Barinade", dun_Jabu)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Boomerang]); });
const check_JabuStone = new Check("jabuStone", "Stone/Medaillon", dun_Jabu).SetCheckType(2)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Boomerang]); });

const check_ICMap = new Check("icMap", "Map", dun_IceCavern);
const check_ICCompass = new Check("icCompass", "Compass", dun_IceCavern);
const check_ICHeart = new Check("icHeart", "Heart", dun_IceCavern);
const check_ICBoots = new Check("icBoots", "Iron Boots", dun_IceCavern);
const check_ICSerenade = new Check("icSerenade", "Serenade of Water", dun_IceCavern).SetCheckType(1)

//Castle
const check_MarketSlingshot = new Check("marketSlingshot", "Slingshot Game", zone_Market);
const check_MarketBowling1 = new Check("marketBowling1", "Bombchu Bowling #1", zone_Market)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_BombBag1]); });
const check_MarketBowling2 = new Check("marketBowling2", "Bombchu Bowling #2", zone_Market)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_BombBag1]); });
const check_MarketRichard = new Check("marketRichard", "Richard the Dog", zone_Market);
const check_MarketCMG = new Check("marketCMG", "Chest Mini Game", zone_Market)
    .SetLogicValidator(function() { return SubLogic_LensOfTruth(); });
const check_MarketPoe = new Check("marketPoe", "Big Poes", zone_Market)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_EmptyBottle, song_Epona, item_Bow1]); });

const check_HCMalon = new Check("hcMalon", "Malon outside Castle", zone_HyruleCastle).SetItem(item_Mask1, true).SetLockedState(2, true).SetHintState(true, true);;
const check_HCLullaby = new Check("hcLullaby", "Zelda's Lullaby", zone_HyruleCastle).SetCheckType(1)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Mask2]); });
const check_HCFairy = new Check("hcFairy", "Din's fire Fairy", zone_HyruleCastle)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_BombBag1, song_Zelda]); });

const check_ToTMaster = new Check("totMaster", "Master Sword", zone_TempleOfTime).SetItem(item_MasterSword, true).SetLockedState(2, true).SetHintState(true, true);
const check_ToTPrelude = new Check("totPrelude", "Prelude of Light", zone_TempleOfTime).SetCheckType(1)
    .SetLogicValidator(function() { return DoesHaveThoseItems([stone_Forest]); });
const check_ToTLACS = new Check("totLACS", "Light Arrows", zone_TempleOfTime)
    .SetLogicValidator(function() { return DoesHaveThoseItems([stone_Shadow, stone_Spirit]); });

const check_OutGanonFairy = new Check("outGanonFairy", "Double Defense Fairy", zone_OutsideGanon)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Zelda, item_Strength3]); });

const check_GanonForest = new Check("ganonForest", "Forest Trial", dun_Ganon);
const check_GanonWater1 = new Check("ganonWater1", "Water Trial (Left)", dun_Ganon);
const check_GanonWater2 = new Check("ganonWater2", "Water Trial (Right)", dun_Ganon);
const check_GanonShadow1 = new Check("ganonShadow1", "Shadow Trial (Closest)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Bow1, item_FireArrow])
    || DoesHaveAnyOfThoseItems([item_Hookshot, item_HoverBoots, song_Time])});
const check_GanonShadow2 = new Check("ganonShadow2", "Shadow Trial (Farest)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Bow1, item_FireArrow])
        || DoesHaveAnyOfThoseItems([item_HoverBoots, item_Din])
        || DoesHaveThoseItems([item_Longshot]);});
const check_GanonLight1 = new Check("ganonLight1", "Light Trial (Left Closest)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength3]);});
const check_GanonLight2 = new Check("ganonLight2", "Light Trial (Left Middle)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength3]);});
const check_GanonLight3 = new Check("ganonLight3", "Light Trial (Left Farest)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength3]);});
const check_GanonLight4 = new Check("ganonLight4", "Light Trial (Right Closest)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength3]);});
const check_GanonLight5 = new Check("ganonLight5", "Light Trial (Right Middle)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength3]);});
const check_GanonLight6 = new Check("ganonLight6", "Light Trial (Right Farest)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength3]);});
const check_GanonLight7 = new Check("ganonLight7", "Light Trial (Enemies)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength3]);});
const check_GanonLight8 = new Check("ganonLight8", "Light Trial (Lullaby)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength3, song_Zelda, item_keyGanon]);});
const check_GanonSpirit1 = new Check("ganonSpirit1", "Spirit Trial (Switch)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Hookshot]);});
const check_GanonSpirit2 = new Check("ganonSpirit2", "Spirit Trial (Invisible)", dun_Ganon)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Hookshot, item_Bombchus]);});
const check_GanonBK = new Check("ganonBK", "Boss Key", dun_Ganon)
    .SetLogicValidator(function () { return SubLogic_GanonTemple_BossKeyLogic(); });

//Lake
const check_LakeFishC = new Check("lakeFishC", "Fishing (Child)", zone_LakeHylia);
const check_LakeFishA = new Check("lakeFishA", "Fishing (Adult)", zone_LakeHylia)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Beans])
        || DoesHaveThoseItems([item_Hookshot, song_Scarecrow])
        || IsCheckInLogic(check_WaterStone); });
const check_LakeRuto = new Check("lakeRuto", "Ruto's Letter", zone_LakeHylia)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Scale1]); });
const check_LakeLabT = new Check("lakeLabT", "Lab (Top)", zone_LakeHylia)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Beans])
        || DoesHaveThoseItems([item_Hookshot, song_Scarecrow]); });
const check_LakeLabD = new Check("lakeLabD", "Lab (Dive)", zone_LakeHylia)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Scale2]); });
const check_LakeSun = new Check("lakeSun", "Shoot the Sun", zone_LakeHylia)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1])
        && DoesHaveThoseItems([item_Longshot, song_Scarecrow])
        && IsCheckInLogic(check_WaterStone); });

const check_WaterMap = new Check("waterMap", "Map", dun_Water);
const check_WaterCrack = new Check("waterCrack", "Cracked Wall", dun_Water)
    .SetLogicValidator(function () { return (DoesHaveAnyOfThoseItems([item_Bow1, item_Din])
        || DoesHaveThoseItems([item_keyWater, item_keyWater, item_keyWater, item_keyWater, item_keyWater]))
        && DoesHaveThoseItems([song_Zelda, item_BombBag1]); });
const check_WaterTorches = new Check("waterTorches", "Light the Torches", dun_Water)
    .SetLogicValidator(function () { return DoesHaveAnyOfThoseItems([item_Bow1, item_Din])
        && DoesHaveThoseItems([song_Zelda]); });
const check_WaterCompass = new Check("waterCompass", "Compass", dun_Water);
const check_WaterBasement = new Check("waterBasement", "Central Basement", dun_Water)
    .SetLogicValidator(function () { return (DoesHaveAnyOfThoseItems([item_Bow1, item_Din])
        || DoesHaveThoseItems([item_keyWater, item_keyWater, item_keyWater, item_keyWater, item_keyWater]))
        && SubLogic_ZoraTunicAccess() && DoesHaveThoseItems([song_Zelda]); });
const check_WaterEye = new Check("waterEye", "Quick Eye Switch", dun_Water)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Bow1, item_Strength1, song_Zelda])
    && DoesHaveAnyOfThoseItems([item_HoverBoots, item_Longshot]); });
const check_WaterLongshot = new Check("waterLongshot", "Longshot", dun_Water)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Longshot, item_keyWater, item_keyWater, item_keyWater, item_keyWater, item_keyWater, item_keyWater])
        && (DoesHaveThoseItems([song_Zelda]) || keySanity); });
const check_WaterRiver = new Check("waterRiver", "Whirlpool River", dun_Water)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Bow1, song_Time, item_Longshot, item_keyWater, item_keyWater, item_keyWater, item_keyWater, item_keyWater, item_keyWater])
        && (DoesHaveThoseItems([song_Zelda]) || keySanity); });
const check_WaterDragon = new Check("waterDragon", "Dragon Switch", dun_Water)
    .SetLogicValidator(function () { return DoesHaveThoseItems([song_Zelda, item_Strength1])
        && (DoesHaveThoseItems([song_Time, item_Bow1, item_keyWater, item_keyWater, item_keyWater, item_keyWater, item_keyWater, item_keyWater])
            && (DoesHaveThoseItems([song_Zelda]) || keySanity)); });
const check_WaterBK = new Check("waterBK", "Dragon Switch", dun_Water)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Longshot ,item_keyWater, item_keyWater, item_keyWater, item_keyWater, item_keyWater, item_keyWater])
        && (DoesHaveThoseItems([song_Zelda]) || keySanity)
        && (DoesHaveThoseItems([item_BombBag1, item_Strength1]) || DoesHaveThoseItems([item_HoverBoots])); });
const check_WaterMorpha = new Check("waterMorpha", "Morpha", dun_Water)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_bosskeyWater, item_Longshot]);});
const check_WaterStone = new Check("waterStone", "Stone/Medaillon", dun_Water).SetCheckType(2)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_bosskeyWater, item_Longshot]);});

//Kakariko
const check_KakRedead = new Check("kakRedead", "Redead Grotto", zone_Kakariko)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Hammer, item_BombBag1]); });
const check_KakGrotto = new Check("kakGrotto", "Open Back Grotto", zone_Kakariko);
const check_KakAnjuC = new Check("kakAnjuC", "Anju's Cuccos", zone_Kakariko);
const check_KakAnjuA = new Check("kakAnjuA", "Anju's Egg", zone_Kakariko);
const check_KakCow = new Check("kakCow", "Cow Cage", zone_Kakariko);
const check_KakArchery = new Check("kakArchery", "Archery Game", zone_Kakariko)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1]); });
const check_KakRoof = new Check("kakRoof", "Man on Roof", zone_Kakariko)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Hookshot]); });
const check_KakWindmill = new Check("kakWindmill", "Windmill Heart", zone_Kakariko);
const check_Kak10Skull = new Check("kak10Skull", "10 Gold Skulltulas Reward", zone_Kakariko);
const check_Kak20Skull = new Check("kak20Skull", "20 Gold Skulltulas Reward", zone_Kakariko);
const check_Kak30Skull = new Check("kak30Skull", "30 Gold Skulltulas Reward", zone_Kakariko);
const check_Kak40Skull = new Check("kak40Skull", "40 Gold Skulltulas Reward", zone_Kakariko);
const check_Kak50Skull = new Check("kak50Skull", "50 Gold Skulltulas Reward", zone_Kakariko);
const check_KakStorm = new Check("kakStorm", "Song of Storm", zone_Kakariko).SetCheckType(1)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Ocarina1]); });
const check_KakNocturne = new Check("kakNocturne", "Nocturne of Shadow", zone_Kakariko).SetCheckType(1)
    .SetLogicValidator(function() { return DoesHaveThoseItems([stone_Forest]); });

const check_GraveShield = new Check("graveShield", "Shield Grave", zone_Graveyard);
const check_GraveDampeT = new Check("graveDampeT", "Dampe's Tour", zone_Graveyard);
const check_GraveDampeR1 = new Check("graveDampeR1", "Dampe's Race", zone_Graveyard);
const check_GraveDampeR2 = new Check("graveDampeR2", "Dampe's Race (under 1'00\")", zone_Graveyard);
const check_GraveRedead = new Check("graveRedead", "Redead Chest", zone_Graveyard)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Sun])
    && (DoesHaveThoseItems([item_Din]) || DoesHaveAnyOfThoseItems([item_Bow1, item_FireArrow]));});
const check_GraveCrate = new Check("graveCrate", "High Crate", zone_Graveyard)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Beans, item_Longshot]); });
const check_GraveTorches = new Check("graveTorches", "Royal Tomb Torches", zone_Graveyard)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Zelda]); });
const check_GraveSun = new Check("graveSun", "Sun Song", zone_Graveyard).SetCheckType(1)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Zelda]); });

const check_BotwFrontBomb = new Check("botwFrontBomb", "Front Bombable", dun_BotW)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_BombBag1]); });
const check_BotwFrontHidden = new Check("botwFrontHidden", "Front Hidden", dun_BotW)
    .SetLogicValidator(function () { return SubLogic_LensOfTruth(); });
const check_BotwCompass = new Check("botwCompass", "Compass", dun_BotW)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_BombBag1])
        || (DoesHaveThoseItems([item_Strength1])
            && (DoesHaveThoseItems([item_keyBotW, item_keyBotW, item_keyBotW]) && SubLogic_LensOfTruth())
            || DoesHaveThoseItems([item_Din])); });
const check_BotwSmallCenter = new Check("botwSmallCenter", "Small Center", dun_BotW)
    .SetLogicValidator(function () { return SubLogic_LensOfTruth(); });
const check_BotwRightHidden = new Check("botwRightHidden", "Right Hidden", dun_BotW)
    .SetLogicValidator(function () { return SubLogic_LensOfTruth(); });
const check_BotwBeamosRoom = new Check("botwBeamosRoom", "Beamos Room", dun_BotW)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_keyBotW, item_keyBotW, item_keyBotW]); });
const check_BotwLike = new Check("botwLike", "Like Like Cage", dun_BotW)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_keyBotW, item_keyBotW, item_keyBotW]); });
const check_BotwMap = new Check("botwMap", "Map", dun_BotW)
    .SetLogicValidator(function () { return SubLogic_LensOfTruth(); });
const check_BotwBackBomb = new Check("botwBackBomb", "Back Bombable", dun_BotW)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_BombBag1]); });
const check_BotwLeftWater = new Check("botwLeftWater", "Underwater Left", dun_BotW)
    .SetLogicValidator(function () { return DoesHaveThoseItems([song_Zelda]); });
const check_BotwCoffin = new Check("botwCoffin", "Coffin Key", dun_BotW);
const check_BotwFrontWater = new Check("botwFrontWater", "Underwater Front", dun_BotW)
    .SetLogicValidator(function () { return DoesHaveThoseItems([song_Zelda]); });
const check_BotwInvisible = new Check("botwInvisible", "Invisible Chest", dun_BotW)
    .SetLogicValidator(function () { return DoesHaveThoseItems([song_Zelda]); });
const check_BotwLens = new Check("botwLens", "Lens of Truth", dun_BotW)
    .SetLogicValidator(function () { return DoesHaveThoseItems([song_Zelda, item_KokiriSword]); });

const check_ShadowMap = new Check("shadowMap", "Map", dun_Shadow);
const check_ShadowHover = new Check("shadowHover", "Dead Hand", dun_Shadow);
const check_ShadowCompass = new Check("shadowCompass", "Compass", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots]); });
const check_ShadowSilver = new Check("shadowSilver", "Silver Rupees", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots]); });
const check_ShadowInvisibleL = new Check("shadowInvisibleL", "Invisible Spinner (Left)", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_keyShadow]); });
const check_ShadowInvisibleR = new Check("shadowInvisibleR", "Invisible Spinner (Right)", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_keyShadow]); });
const check_ShadowSpikeL = new Check("shadowSpikeL", "Falling Spikes Low", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_keyShadow]); });
const check_ShadowSpikeHB = new Check("shadowSpikeHB", "Falling Spikes High (Button)", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Strength1, item_keyShadow]); });
const check_ShadowSpikeHI = new Check("shadowSpikeHI", "Falling Spikes High (Invisible)", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Strength1, item_keyShadow]); });
const check_ShadowRedead = new Check("shadowRedead", "Redead Silver Rupees", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_keyShadow, item_keyShadow]); });
const check_ShadowPot = new Check("shadowPot", "Skull Pot", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Hookshot, item_keyShadow, item_keyShadow]); });
const check_ShadowWind = new Check("shadowWind", "Wind Room Hint", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Hookshot, item_keyShadow, item_keyShadow, item_keyShadow]); });
const check_ShadowGibdosK = new Check("shadowGibdosK", "Gibdos (Kill)", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Hookshot, item_keyShadow, item_keyShadow, item_keyShadow]); });
const check_ShadowGibdosH = new Check("shadowGibdosH", "Gibdos (Hidden)", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Hookshot, item_keyShadow, item_keyShadow, item_keyShadow]); });
const check_ShadowBK = new Check("shadowBK", "Boss Key", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Hookshot, song_Zelda, item_keyShadow, item_keyShadow, item_keyShadow, item_keyShadow]); });
const check_ShadowNearBK = new Check("shadowNearBK", "Near Boss Key", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Hookshot, song_Zelda, item_keyShadow, item_keyShadow, item_keyShadow, item_keyShadow]); });
const check_ShadowFloormaster = new Check("shadowFloormaster", "Floormaster", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Hookshot, song_Zelda, item_keyShadow, item_keyShadow, item_keyShadow, item_keyShadow]); });
const check_ShadowBongo = new Check("shadowBongo", "Bongo Bongo", dun_Shadow)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Hookshot, song_Zelda, item_keyShadow, item_keyShadow, item_keyShadow, item_keyShadow, item_keyShadow, item_bosskeyShadow])
        && DoesHaveAnyOfThoseItems([item_Longshot, item_Bow1]); });
const check_ShadowStone = new Check("shadowStone", "Stone/Medaillon", dun_Shadow).SetCheckType(2)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_HoverBoots, item_BombBag1, item_Hookshot, song_Zelda, item_keyShadow, item_keyShadow, item_keyShadow, item_keyShadow, item_keyShadow, item_bosskeyShadow])
            && DoesHaveAnyOfThoseItems([item_Longshot, item_Bow1]); });

//Desert
const check_ValleyCrate = new Check("valleyCrate", "Crate Heart", zone_Valley);
const check_ValleyWaterfall = new Check("valleyWaterfall", "Waterfall Heart", zone_Valley);
const check_ValleyHammer = new Check("valleyHammer", "Hammer Chest", zone_Valley)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Hammer]) && SubLogic_GerudoFortressAccess(); });

const check_FortressGMC = new Check("fortressGMC", "Gerudo Membership Card", zone_Fortress).SetItem(item_MemberCard, true).SetLockedState(2, true).SetHintState(true, true)
	.SetLogicValidator(function() { return SubLogic_GerudoFortressAccess(); });
const check_FortressRoof = new Check("fortressRoof", "Rooftop Chest", zone_Fortress)
    .SetLogicValidator(function() { return SubLogic_GerudoFortressAccess()
        && (DoesHaveAnyOfThoseItems([item_Hookshot, song_Scarecrow])
        || DoesHaveAnyOfThoseItems([item_Longshot, item_HoverBoots])); });
const check_FortressArchery10 = new Check("fortressArchery10", "Archery (1000pts)", zone_Fortress)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Epona, item_Bow1]); });
const check_FortressArchery15 = new Check("fortressArchery15", "Archery (1500pts)", zone_Fortress)
    .SetLogicValidator(function() { return DoesHaveThoseItems([song_Epona, item_Bow1]); });

const check_WastelandTorches = new Check("wastelandTorches", "Light the Torches", zone_Wasteland)
	.SetLogicValidator(function() { return SubLogic_GerudoFortressAccess()
		&& DoesHaveAnyOfThoseItems([item_Longshot, item_HoverBoots])
		&& (DoesHaveThoseItems([item_Din]
			|| DoesHaveThoseItems([item_Bow1, item_FireArrow]))); });

const check_ColossusFairy = new Check("colossusFairy", "Nayru's Love Fairy", zone_Colossus)
	.SetLogicValidator(function() { return DoesHaveThoseItems([song_Zelda, item_BombBag1])
		&&  (DoesHaveThoseItems([song_Requiem])
			|| (SubLogic_GerudoFortressAccess()
				&& SubLogic_LensOfTruth()
				&& DoesHaveAnyOfThoseItems([item_Longshot, item_HoverBoots]))); });
const check_ColossusArch = new Check("colossusArch", "Arch Heart", zone_Colossus)
	.SetLogicValidator(function() { return DoesHaveThoseItems([item_Beans, song_Requiem]); });
const check_ColossusRequiem = new Check("colossusRequiem", "Requiem of Spirit", zone_Colossus).SetCheckType(1)
	.SetLogicValidator(function() { return DoesHaveThoseItems([song_Requiem])
		|| (SubLogic_GerudoFortressAccess()
			&& SubLogic_LensOfTruth()
			&& DoesHaveAnyOfThoseItems([item_Longshot, item_HoverBoots])); });

const check_GTGLobby1 = new Check("gtgLobby1", "Lobby Eye Switch 1", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1]); });
const check_GTGLobby2 = new Check("gtgLobby2", "", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1]); });
const check_GTGStalfos = new Check("gtgStalfos", "Stalfos", dun_GTG);
const check_GTGWolfos = new Check("gtgWolfos", "Wolfos", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Hookshot]); });
const check_GTGLike1 = new Check("gtgLike1", "Like Like (Farest)", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Hookshot, item_Strength2]); });
const check_GTGLike2 = new Check("gtgLike2", "Like Like (Second Farest)", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Hookshot, item_Strength2]); });
const check_GTGLike3 = new Check("gtgLike3", "Like Like (Second Closest)", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Hookshot, item_Strength2]); });
const check_GTGLike4 = new Check("gtgLike4", "Like Like (Closest)", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Hookshot, item_Strength2]); });
const check_GTGStatue = new Check("gtgStatue", "Eye Statues", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1])
        && (DoesHaveThoseItems([item_Hookshot, item_Lens])
        || IsCheckInLogic(check_GTGFlamingC)); });
const check_GTGAboveStatue = new Check("gtgAboveStatue", "Above Eye Statues", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Bow1, item_Hookshot]); });
const check_GTGFlamingC = new Check("gtgFlamingC", "Flaming Chest", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Hammer, item_Hookshot])
        && (DoesHaveAnyOfThoseItems(item_BombBag1) || DoesHaveThoseItems([item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG])); });
const check_GTGFlamingE = new Check("gtgFlamingE", "Flaming Enemies", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_Hookshot])
        && (DoesHaveAnyOfThoseItems(item_BombBag1) || DoesHaveThoseItems([item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG])); });
const check_GTGBeamos = new Check("gtgBeamos", "Beamos", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_BombBag1]); });
const check_GTGStanding = new Check("gtgStanding", "Free Standing", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG])
        || DoesHaveThoseItems([song_Time, item_BombBag1]); });
const check_GTGMazeR1 = new Check("gtgMazeR1", "Maze Right (Front)", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG])
        || DoesHaveThoseItems([song_Time, item_BombBag1]); });
const check_GTGMazeR2 = new Check("gtgMazeR2", "Maze Right (Right)", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG])
        || DoesHaveThoseItems([song_Time, item_BombBag1]); });
const check_GTGToilets = new Check("gtgToilets", "GTG Toilets", dun_GTG);
const check_GTGFake= new Check("gtgFake", "Fake Ceiling", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_keyGTG, item_keyGTG, item_keyGTG]); });
const check_GTGLeft1 = new Check("gtgLeft1", "Maze Left #1", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG]); });
const check_GTGLeft2 = new Check("gtgLeft2", "Maze Left #2", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG]); });
const check_GTGLeft3 = new Check("gtgLeft3", "Maze Left #3", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG]); });
const check_GTGIce = new Check("gtgIce", "Ice Arrows", dun_GTG)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG, item_keyGTG]); });

const check_SpiritChild1 = new Check("spiritChild1", "Child-Only (Left)", dun_Spirit)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Boomerang, item_Slingshot1, item_Bombchus]); });
const check_SpiritChild2 = new Check("spiritChild2", "Child-Only (Right)", dun_Spirit)
    .SetLogicValidator(function() { return DoesHaveAnyOfThoseItems([item_Boomerang, item_Slingshot1, item_Bombchus]); });
const check_SpiritLizalfos1 = new Check("spiritLizalfos1", "Lizalfos Sun Room (Visible)", dun_Spirit)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_keySpirit])
        && DoesHaveAnyOfThoseItems([song_Requiem, item_Strength2])
            && (DoesHaveThoseItems([item_BombBag1])
                || (DoesHaveAnyOfThoseItems([item_Boomerang, item_Slingshot1])
                    && DoesHaveAnyOfThoseItems([item_Hookshot, item_Bow1]))
                || (DoesHaveThoseItems([item_Strength2, item_keySpirit, item_keySpirit, item_keySpirit])
                    && DoesHaveAnyOfThoseItems([item_Hookshot, item_Bow1]))
                || (DoesHaveThoseItems([song_Requiem, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])
                    && DoesHaveAnyOfThoseItems([item_Boomerang, item_Slingshot1])))});
const check_SpiritLizalfos2 = new Check("spiritLizalfos2", "Lizalfos Sun Room (Switch)", dun_Spirit)
    .SetLogicValidator(function() { return DoesHaveThoseItems([item_keySpirit])
            && DoesHaveAnyOfThoseItems([song_Requiem, item_Strength2])
            && (DoesHaveThoseItems([item_BombBag1])
                || (DoesHaveAnyOfThoseItems([item_Boomerang, item_Slingshot1])
                    && DoesHaveAnyOfThoseItems([item_Hookshot, item_Bow1]))
                || (DoesHaveThoseItems([item_Strength2, item_keySpirit, item_keySpirit, item_keySpirit])
                    && DoesHaveAnyOfThoseItems([item_Hookshot, item_Bow1]))
                || (DoesHaveThoseItems([song_Requiem, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])
                    && DoesHaveAnyOfThoseItems([item_Boomerang, item_Slingshot1])))});
const check_SpiritMap = new Check("spiritMap", "Map", dun_Spirit)
    .SetLogicValidator(function () { return SubLogic_SpiritTemple_CentralChamberAccess()
    && (((DoesHaveThoseItems([item_keySpirit, item_keySpirit, item_keySpirit]) || DoesHaveThoseItems([item_BombBag1]))
        && (DoesHaveThoseItems([item_FireArrow]) && DoesHaveAnyOfThoseItems([item_Din, item_Bow1])))
        || DoesHaveThoseItems([item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_BombBag1, song_Requiem]));});
const check_SpiritTorches = new Check("spiritTorches", "Torch Puzzle", dun_Spirit)
    .SetLogicValidator(function () { return SubLogic_SpiritTemple_CentralChamberAccess()
    && (((DoesHaveThoseItems([item_keySpirit, item_keySpirit, item_keySpirit]) || DoesHaveThoseItems([item_BombBag1]))
        && (DoesHaveThoseItems([item_FireArrow]) && DoesHaveAnyOfThoseItems([item_Din, item_Bow1])))
        || DoesHaveThoseItems([item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_BombBag1, song_Requiem]));});
const check_SpiritStrength = new Check("spiritStrength", "Silver Gauntlets", dun_Spirit)
    .SetLogicValidator(function () { return SubLogic_SpiritTemple_CentralChamberAccess()
        && (DoesHaveThoseItems([item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])
            || DoesHaveThoseItems([item_keySpirit, item_keySpirit, item_keySpirit, item_Longshot, item_BombBag1])); });
const check_SpiritCompass = new Check("spiritCompass", "Compass", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2, song_Zelda, item_Hookshot])});
const check_SpiritBoulder = new Check("spiritBoulder", "Boulder Room", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2])
    && DoesHaveAnyOfThoseItems([item_Bow1, item_Hookshot, item_Bombchus])});
const check_SpiritFloormaster1 = new Check("spiritFloormaster1", "Invisible Floormaster (Left)", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2, item_keySpirit, item_keySpirit, item_keySpirit])});
const check_SpiritFloormaster2 = new Check("spiritFloormaster2", "Invisible Floormaster (Right)", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2, item_keySpirit, item_keySpirit, item_keySpirit])});
const check_SpiritLullaby1 = new Check("spiritLullaby1", "Lullaby (hand chest)", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2, item_keySpirit, item_keySpirit, item_keySpirit, song_Zelda])});
const check_SpiritLullaby2 = new Check("spiritLullaby2", "Lullaby (ledge chest)", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2, item_keySpirit, item_keySpirit, item_keySpirit, song_Zelda])
    && DoesHaveAnyOfThoseItems([item_Hookshot, item_HoverBoots])});
const check_SpiritInvisibleL = new Check("spiritInvisibleL", "Invisible Chest (Left)", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2, item_BombBag1, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])});
const check_SpiritInvisibleR = new Check("spiritInvisibleR", "Invisible Chest (Right)", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2, item_BombBag1, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])});
const check_SpiritArmos = new Check("spiritArmos", "Sun near Armos", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2, item_BombBag1, item_MirrorShield, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])});
const check_SpiritMirror = new Check("spiritMirror", "Mirror Shield", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_BombBag1, item_Strength2, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])});
const check_SpiritBK = new Check("spiritBK", "Boss Key", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2, item_Hookshot, song_Zelda, item_Bow1, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])
    && DoesHaveAnyOfThoseItems([item_BombBag1, item_Hammer])});
const check_SpiritTopmost = new Check("spiritTopmost", "Topmost Sun", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Strength2, item_MirrorShield, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])
    && DoesHaveAnyOfThoseItems([item_Hookshot, item_Bow1, item_BombBag1])});
const check_SpiritTwinrova = new Check("spiritTwinrova", "Twinrova", dun_Spirit)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Hookshot, item_MirrorShield, item_BombBag1, item_Strength2, item_bosskeySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])});
const check_SpiritStone = new Check("spiritStone", "Stone/Medaillon", dun_Spirit).SetCheckType(2)
    .SetLogicValidator(function () { return DoesHaveThoseItems([item_Hookshot, item_MirrorShield, item_BombBag1, item_Strength2, item_bosskeySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit, item_keySpirit])});

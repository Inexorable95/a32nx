const REFUEL_FACTOR = 0.42;
const CENTER_MODIFIER = 3;

class A32NX_Refuel {
    constructor() {}

    init() {
        const centerCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK CENTER QUANTITY", "Gallons");
        const LInnCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "Gallons");
        const LOutCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK LEFT AUX QUANTITY", "Gallons");
        const RInnCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "Gallons");
        const ROutCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK RIGHT AUX QUANTITY", "Gallons");
        SimVar.SetSimVarValue("L:A32NX_FUEL_CENTER_DESIRED", "Number", centerCurrentSimVar);
        SimVar.SetSimVarValue("L:A32NX_FUEL_LEFT_MAIN_DESIRED", "Number", LInnCurrentSimVar);
        SimVar.SetSimVarValue("L:A32NX_FUEL_LEFT_AUX_DESIRED", "Number", LOutCurrentSimVar);
        SimVar.SetSimVarValue("L:A32NX_FUEL_RIGHT_MAIN_DESIRED", "Number", RInnCurrentSimVar);
        SimVar.SetSimVarValue("L:A32NX_FUEL_RIGHT_AUX_DESIRED", "Number", ROutCurrentSimVar);
    }

    defuelTank(multiplier) {
        return -REFUEL_FACTOR * multiplier;
    }
    refuelTank(multiplier) {
        return REFUEL_FACTOR * multiplier;
    }

    update(_deltaTime) {
        const gs = SimVar.GetSimVarValue("GPS GROUND SPEED", "knots");
        if (gs > 0.1) {
            return;
        }
        const onGround = SimVar.GetSimVarValue("SIM ON GROUND", "Bool");
        const eng1Running = SimVar.GetSimVarValue("ENG COMBUSTION:1", "Bool");
        const eng2Running = SimVar.GetSimVarValue("ENG COMBUSTION:2", "Bool");
        if (!onGround || eng1Running || eng2Running) {
            return;
        }
        const refuelRate = SimVar.GetSimVarValue("L:A32NX_REFUEL_RATE_SETTING", "Number");
        const centerTargetSimVar = SimVar.GetSimVarValue("L:A32NX_FUEL_CENTER_DESIRED", "Number");
        const LInnTargetSimVar = SimVar.GetSimVarValue("L:A32NX_FUEL_LEFT_MAIN_DESIRED", "Number");
        const LOutTargetSimVar = SimVar.GetSimVarValue("L:A32NX_FUEL_LEFT_AUX_DESIRED", "Number");
        const RInnTargetSimVar = SimVar.GetSimVarValue("L:A32NX_FUEL_RIGHT_MAIN_DESIRED", "Number");
        const ROutTargetSimVar = SimVar.GetSimVarValue("L:A32NX_FUEL_RIGHT_AUX_DESIRED", "Number");
        const centerCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK CENTER QUANTITY", "Gallons");
        const LInnCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "Gallons");
        const LOutCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK LEFT AUX QUANTITY", "Gallons");
        const RInnCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "Gallons");
        const ROutCurrentSimVar = SimVar.GetSimVarValue("FUEL TANK RIGHT AUX QUANTITY", "Gallons");
        let centerCurrent = centerCurrentSimVar + 6;
        let LInnCurrent = LInnCurrentSimVar + 7;
        let LOutCurrent = LOutCurrentSimVar + 1;
        let RInnCurrent = RInnCurrentSimVar + 7;
        let ROutCurrent = ROutCurrentSimVar + 1;
        const centerTarget = centerTargetSimVar + 6;
        const LInnTarget = LInnTargetSimVar + 7;
        const LOutTarget = LOutTargetSimVar + 1;
        const RInnTarget = RInnTargetSimVar + 7;
        const ROutTarget = ROutTargetSimVar + 1;
        if (refuelRate == 2) {
            SimVar.SetSimVarValue("FUEL TANK CENTER QUANTITY", "Gallons", centerTarget);
            SimVar.SetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "Gallons", LInnTarget);
            SimVar.SetSimVarValue("FUEL TANK LEFT AUX QUANTITY", "Gallons", LOutTarget);
            SimVar.SetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "Gallons", RInnTarget);
            SimVar.SetSimVarValue("FUEL TANK RIGHT AUX QUANTITY", "Gallons", ROutTarget);
            return;
        }
        let multiplier = 1 * REFUEL_FACTOR;
        if (refuelRate == 1) {
            multiplier = 5 * REFUEL_FACTOR;
        }
        //DEFUELING (center tank first, then main, then aux)
        if (centerCurrent > centerTarget) {
            centerCurrent += this.defuelTank(multiplier) * CENTER_MODIFIER;
            if (centerCurrent < centerTarget) {
                centerCurrent = centerTarget;
            }
            SimVar.SetSimVarValue("FUEL TANK CENTER QUANTITY", "Gallons", centerCurrent);
            if (centerCurrent != centerTarget) {
                return;
            }
        }
        if (LInnCurrent > LInnTarget || RInnCurrent > RInnTarget) {
            LInnCurrent += this.defuelTank(multiplier) / 2;
            RInnCurrent += this.defuelTank(multiplier) / 2;
            if (LInnCurrent < LInnTarget) {
                LInnCurrent = LInnTarget;
            }
            if (RInnCurrent < RInnTarget) {
                RInnCurrent = RInnTarget;
            }
            SimVar.SetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "Gallons", RInnCurrent);
            SimVar.SetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "Gallons", LInnCurrent);
            if (LInnCurrent != LInnTarget || RInnCurrent != RInnTarget) {
                return;
            }
        }
        if (LOutCurrent > LOutTarget || ROutCurrent > ROutTarget) {
            LOutCurrent += this.defuelTank(multiplier) / 2;
            ROutCurrent += this.defuelTank(multiplier) / 2;
            if (LOutCurrent < LOutTarget) {
                LOutCurrent = LOutTarget;
            }
            if (ROutCurrent < ROutTarget) {
                ROutCurrent = ROutTarget;
            }
            SimVar.SetSimVarValue("FUEL TANK RIGHT AUX QUANTITY", "Gallons", ROutCurrent);
            SimVar.SetSimVarValue("FUEL TANK LEFT AUX QUANTITY", "Gallons", LOutCurrent);
            if (LOutCurrent != LOutTarget || ROutCurrent != ROutTarget) {
                return;
            }
        }
        // REFUELING (aux first, then main, then center tank)
        if (LOutCurrent < LOutTarget || ROutCurrent < ROutTarget) {
            LOutCurrent += this.refuelTank(multiplier) / 2;
            ROutCurrent += this.refuelTank(multiplier) / 2;
            if (LOutCurrent > LOutTarget) {
                LOutCurrent = LOutTarget;
            }
            if (ROutCurrent > ROutTarget) {
                ROutCurrent = ROutTarget;
            }
            SimVar.SetSimVarValue("FUEL TANK RIGHT AUX QUANTITY", "Gallons", ROutCurrent);
            SimVar.SetSimVarValue("FUEL TANK LEFT AUX QUANTITY", "Gallons", LOutCurrent);
            if (LOutCurrent != LOutTarget || ROutCurrent != ROutTarget) {
                return;
            }
        }
        if (LInnCurrent < LInnTarget || RInnCurrent < RInnTarget) {
            LInnCurrent += this.refuelTank(multiplier) / 2;
            RInnCurrent += this.refuelTank(multiplier) / 2;
            if (LInnCurrent > LInnTarget) {
                LInnCurrent = LInnTarget;
            }
            if (RInnCurrent > RInnTarget) {
                RInnCurrent = RInnTarget;
            }
            SimVar.SetSimVarValue("FUEL TANK RIGHT MAIN QUANTITY", "Gallons", RInnCurrent);
            SimVar.SetSimVarValue("FUEL TANK LEFT MAIN QUANTITY", "Gallons", LInnCurrent);
            if (LInnCurrent != LInnTarget || RInnCurrent != RInnTarget) {
                return;
            }
        }
        if (centerCurrent < centerTarget) {
            centerCurrent += this.refuelTank(multiplier) * CENTER_MODIFIER;
            if (centerCurrent > centerTarget) {
                centerCurrent = centerTarget;
            }
            SimVar.SetSimVarValue("FUEL TANK CENTER QUANTITY", "Gallons", centerCurrent);
            if (centerCurrent != centerTarget) {
                return;
            }
        }
    }
}
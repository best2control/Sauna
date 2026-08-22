
window.saunaExtensionData = {
    TempTarget: 50.0,
    Hysteresis: 1,
    Countdown: 60,
    NTCBeta: 3950.0,
    NTCR25: 10000.0,
    RSeries: 10000.0
};

window.lastSaunaFormState = {
    TempTarget: null,
    Hysteresis: null,
    Countdown: null,
    NTCBeta: null,
    NTCR25: null,
    RSeries: null
};

window.saunaReady = false;
window.forceSaunaSync = true;

window.updateSaunaStatus = function(status, timeStr) {
    const led9 = document.getElementById('led-9');
    const saunaUpdate = document.getElementById('panel-sauna-update');
    
    if (status === 'online') {
        if (led9) led9.className = 'led-node green-on';
        if (saunaUpdate) saunaUpdate.innerText = timeStr;
    } else {
        if (led9) led9.className = 'led-node';
        if (typeof window.clearSaunaPanel === 'function') window.clearSaunaPanel();
    }
};

window.updateSaunaData = function(data, timeStr) {
    const saunaUpdate = document.getElementById('panel-sauna-update');
    if (saunaUpdate) saunaUpdate.innerText = timeStr;
	
	window.saunaExtensionData.TempTarget = (data.TempTarget !== undefined) ? Math.floor(data.TempTarget) : 50.0;
    window.saunaExtensionData.Hysteresis = (data.Hyst !== undefined) ? parseInt(data.Hyst) : 1;
    window.saunaExtensionData.Countdown = (data.CntD !== undefined) ? parseInt(data.CntD) : 60;
    window.saunaExtensionData.NTCBeta = (data.Beta !== undefined) ? parseFloat(data.Beta) : 3950.0;
    window.saunaExtensionData.NTCR25 = (data.R25 !== undefined) ? parseFloat(data.R25) : 10000.0;
    window.saunaExtensionData.RSeries = (data.RSeries !== undefined) ? parseFloat(data.RSeries) : 10000.0;

    // ดึง Element กล่องอินพุตมารอไว้ด้านบนเพื่อใช้ซิงค์ค่าทันที
    const inTarget = document.getElementById('input-temp-target');
    const inHyst = document.getElementById('input-hysteresis');
    const inCount = document.getElementById('input-countdown');
    const inBeta = document.getElementById('input-ntc-beta');
    const inR25 = document.getElementById('input-ntc-r25');
    const inRSer = document.getElementById('input-rseries');
    const force = (window.forceSaunaSync === true);

    // 2. ปรับปรุง: ย้ายการซิงค์ค่าลงฟอร์มอินพุตขึ้นมาไว้ตรงนี้ เพื่อให้ซิงค์ได้ทุกโหมด (แม้ sysMode จะไม่ใช่ 2)
    if (inTarget && data.TempTarget !== undefined) {
        const nextVal = Math.floor(data.TempTarget);
        if (force || window.lastSaunaFormState.TempTarget !== nextVal) {
            inTarget.value = nextVal;
            window.lastSaunaFormState.TempTarget = nextVal;
        }
    }
    if (inHyst && data.Hyst !== undefined) {
        const nextVal = parseInt(data.Hyst);
        if (force || window.lastSaunaFormState.Hysteresis !== nextVal) {
            inHyst.value = nextVal;
            window.lastSaunaFormState.Hysteresis = nextVal;
        }
    }
    if (inCount && data.CntD !== undefined) {
        const nextVal = parseInt(data.CntD);
        if (force || window.lastSaunaFormState.Countdown !== nextVal) {
            const cHH = String(Math.floor(nextVal / 60)).padStart(2, '0');
            const cMM = String(nextVal % 60).padStart(2, '0'); // <-- แก้ไขตัดคำเกินออกแล้ว
            inCount.value = `${cHH}:${cMM}`;
            window.lastSaunaFormState.Countdown = nextVal;
        }
    }
    if (inBeta && document.activeElement !== inBeta) {
        if (data.Beta !== undefined) {
            const nextVal = Math.floor(data.Beta); // ดึงค่าเป็นจำนวนเต็มตามสเปกจริง
            if (force || window.lastSaunaFormState.NTCBeta !== nextVal) {
                inBeta.value = nextVal;
                window.lastSaunaFormState.NTCBeta = nextVal;
            }
        } else if (inBeta.value === "") {
            // ดักจับ: หากเปิดหน้ามาแล้วไม่มีค่าพารามิเตอร์ส่งมา ให้เติมค่าเริ่มต้นทันทีเพื่อความปลอดภัย
            inBeta.value = 3950;
            window.lastSaunaFormState.NTCBeta = 3950;
        }
    }

    // ตรวจสอบช่องกรอก NTC R25
    if (inR25 && document.activeElement !== inR25) {
        if (data.R25 !== undefined) {
            const nextVal = Math.floor(data.R25);
            if (force || window.lastSaunaFormState.NTCR25 !== nextVal) {
                inR25.value = nextVal;
                window.lastSaunaFormState.NTCR25 = nextVal;
            }
        } else if (inR25.value === "") {
            inR25.value = 10000;
            window.lastSaunaFormState.NTCR25 = 10000;
        }
    }

    // ตรวจสอบช่องกรอก RSeries
    if (inRSer && document.activeElement !== inRSer) {
        if (data.RSeries !== undefined) {
            const nextVal = Math.floor(data.RSeries);
            if (force || window.lastSaunaFormState.RSeries !== nextVal) {
                inRSer.value = nextVal;
                window.lastSaunaFormState.RSeries = nextVal;
            }
        } else if (inRSer.value === "") {
            inRSer.value = 10000;
            window.lastSaunaFormState.RSeries = 10000;
        }
    }

    // 3. ปลดล็อกหน้าจอหลัก (แก้ปัญหาหน้าเว็บค้าง)
    if (!window.saunaReady) {
        window.saunaReady = true;
        if (typeof window.checkAllConfigsReady === 'function') window.checkAllConfigsReady();
    }

    // 4. ตรวจสอบสถานะไฟ LED1 (Light) ดักจับไว้เพื่อให้แสดงผลได้ทุกโหมด
    const led1 = document.getElementById('led-1');
    if (led1 && data.isLight !== undefined) {
        const targetClass = (data.isLight === 1) ? 'led-node blue-on' : 'led-node';
        if (led1.className !== targetClass) led1.className = targetClass;
    }

	const saunaFormBox = document.querySelector('.sauna-parameter-form-box');
	
    // 5. ตรวจสอบเงื่อนไข sysMode (หากไม่ใช่โหมดทำงานปกติ ให้ล้างหน้าปัดตัวเลขและดับไฟดวงอื่นลงทันที)
    if (data.sysMode === undefined || data.sysMode !== 2) {
        const saunaTempScreen = document.getElementById('sauna-temp');
        const saunaTimerScreen = document.getElementById('sauna-timer');
        if (saunaTempScreen) { saunaTempScreen.className = 'seven-segment'; saunaTempScreen.innerText = '---°C'; }
        if (saunaTimerScreen) { saunaTimerScreen.className = 'seven-segment'; saunaTimerScreen.innerText = '--:--'; }
        
		if (saunaFormBox) {
            saunaFormBox.style.display = 'none';
        }
		
        const nodes = document.getElementsByClassName("led-node");
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id !== 'led-1' && nodes[i].id !== 'led-9') {
                nodes[i].className = 'led-node';
            }
        }
		if(data.sysMode === undefined ){
			if (typeof window.unlockFormPanel === 'function') window.unlockFormPanel('sauna');
			if (typeof window.unlockSaunaFormOnly === 'function') window.unlockSaunaFormOnly();
			window.forceSaunaSync = false;
			return; 
		}
    }

	if (data.sysMode === 2) {
		if (saunaFormBox) {
            saunaFormBox.style.display = 'block';
        }
		const saunaTempScreen = document.getElementById('sauna-temp');
		const saunaTimerScreen = document.getElementById('sauna-timer');

		
		const led2 = document.getElementById('led-2');
		const led3 = document.getElementById('led-3');
		const led4 = document.getElementById('led-4');
		const led5 = document.getElementById('led-5');
		const led6 = document.getElementById('led-6');
		const led7 = document.getElementById('led-7');
		const led8 = document.getElementById('led-8');

		if (saunaTempScreen && data.Temp !== undefined) {
			saunaTempScreen.className = 'seven-segment screen-on';
			if (data.isF === 1) {
				const fValue = Math.round((data.Temp * 9 / 5) + 32);
				if (saunaTempScreen.innerText !== fValue + '°F') saunaTempScreen.innerText = fValue + '°F';
			} else {
				const cValue =Math.round(data.Temp);
				if (saunaTempScreen.innerText !== cValue + '°C') saunaTempScreen.innerText = cValue + '°C';
			}
		}

		if (saunaTimerScreen) {
			let totalMinutes = 0;
			if (data.isCntD === 1 && data.Countdown !== undefined && data.RunTime !== undefined) {
				totalMinutes = Math.max(0, data.Countdown - data.RunTime - 1);
			} else if (data.RunTime !== undefined) {
				totalMinutes = Math.max(0, data.RunTime);
			}
			
			const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
			const mm = String(totalMinutes % 60).padStart(2, '0');
			const timeDisplayStr = `${hh}:${mm}`;
			if (saunaTimerScreen.innerText !== timeDisplayStr) {
				saunaTimerScreen.className = 'seven-segment screen-on';
				saunaTimerScreen.innerText = timeDisplayStr;
			}
		}

		if (inTarget && data.TempTarget !== undefined) {
			const nextVal = Math.floor(data.TempTarget);
			if (force || window.lastSaunaFormState.TempTarget !== nextVal) {
				inTarget.value = nextVal;
				window.lastSaunaFormState.TempTarget = nextVal;
			}
		}
		if (inHyst && data.Hysteresis !== undefined) {
			const nextVal = parseInt(data.Hysteresis);
			if (force || window.lastSaunaFormState.Hysteresis !== nextVal) {
				inHyst.value = nextVal;
				window.lastSaunaFormState.Hysteresis = nextVal;
			}
		}
		if (inCount && data.Countdown !== undefined) {
			const nextVal = parseInt(data.Countdown);
			if (force || window.lastSaunaFormState.Countdown !== nextVal) {
				const cHH = String(Math.floor(nextVal / 60)).padStart(2, '0');
				const cMM = String(nextVal % 60).padStart(2, '0');
				inCount.value = `${cHH}:${cMM}`;
				window.lastSaunaFormState.Countdown = nextVal;
			}
		}
		if (inBeta && data.NTCBeta !== undefined) {
			const nextVal = parseFloat(data.NTCBeta);
			if (force || window.lastSaunaFormState.NTCBeta !== nextVal) {
				inBeta.value = nextVal;
				window.lastSaunaFormState.NTCBeta = nextVal;
			}
		}
		if (inR25 && data.NTCR25 !== undefined) {
			const nextVal = parseFloat(data.NTCR25);
			if (force || window.lastSaunaFormState.NTCR25 !== nextVal) {
				inR25.value = nextVal;
				window.lastSaunaFormState.NTCR25 = nextVal;
			}
		}
		if (inRSer && data.RSeries !== undefined) {
			const nextVal = parseFloat(data.RSeries);
			if (force || window.lastSaunaFormState.RSeries !== nextVal) {
				inRSer.value = nextVal;
				window.lastSaunaFormState.RSeries = nextVal;
			}
		}

		if (led1 && data.isLight !== undefined) {
			const targetClass = (data.isLight === 1) ? 'led-node blue-on' : 'led-node';
			if (led1.className !== targetClass) led1.className = targetClass;
		}
		
		if (data.isHeater !== undefined) {
			if (data.isHeater === 1) {
				if (led3 && led3.className !== 'led-node yellow-on') led3.className = 'led-node yellow-on';
				if (led2 && led2.className !== 'led-node') led2.className = 'led-node';
			} else {
				if (led3 && led3.className !== 'led-node') led3.className = 'led-node';
				if (led2 && led2.className !== 'led-node green-on') led2.className = 'led-node green-on';
			}
		}
		
		if (data.isModeA !== undefined) {
			if (data.isModeA === 1) {
				if (led4 && led4.className !== 'led-node green-on') led4.className = 'led-node green-on';
				if (led5 && led5.className !== 'led-node') led5.className = 'led-node';
			} else {
				if (led4 && led4.className !== 'led-node') led4.className = 'led-node';
				if (led5 && led5.className !== 'led-node green-on') led5.className = 'led-node green-on';
			}
		}

		if (led6 && data.errI2C !== undefined && data.ntcStatus !== undefined) {
			let targetClass = 'led-node';
			if (data.errI2C === 0 && (data.ntcStatus === 0 || data.ntcStatus === 1)) {
				targetClass = 'led-node red-on'; 
				//targetClass = 'led-node red-flash-active1s'; 
			} else if (data.errI2C === 0 && (data.ntcStatus === 2 || data.ntcStatus === 3)) {
				targetClass = 'led-node red-flash-active2s'; 
			} else if (data.errI2C === 1 || data.ntcStatus === 4 || data.ntcStatus === 5) {
				targetClass = 'led-node red-flash-active1s'; 
			}
			if (led6.className !== targetClass) led6.className = targetClass;
		}
	   

		if (led7 && data.isInterlock !== undefined) {
			const targetClass = (data.isInterlock === 1) ? 'led-node red-on' : 'led-node';
			if (led7.className !== targetClass) led7.className = targetClass;
		}

		if (led8 && data.errThermo !== undefined && data.sysLockdown !== undefined && data.isOverHeat !== undefined) {
			let targetClass = 'led-node';
			if (data.errThermo === 1 || data.sysLockdown===1) {
			targetClass = 'led-node red-flash-active500ms';
			}
			else if (data.isOverHeat === 1) {
				targetClass = 'led-node red-on';
			} 
			if (led8.className !== targetClass) led8.className = targetClass;
		}
		//led8.className ='led-node red-flash-active500ms';
		
		
	}

	if (!window.saunaReflectionCount) window.saunaReflectionCount = 0;

	if (window.saunaReflectionCount === 1) {
		console.log("[MQTT Sauna] First data loop received. Skipping sauna unlock as requested.");
		window.saunaReflectionCount = 2;
	} 
	else if (window.saunaReflectionCount === 2) {
		console.log("[MQTT Sauna] Second data loop received. Confirming sauna action and unlocking UI.");
		window.saunaReflectionCount = 0;
		const saunaFormBox = document.querySelector('.sauna-parameter-form-box'); const isFormLocked = saunaFormBox && saunaFormBox.style.pointerEvents === "none";
		if (typeof window.unlockFormPanel === 'function') { window.unlockFormPanel('sauna'); }
		if (typeof window.unlockSaunaFormOnly === 'function') { window.unlockSaunaFormOnly(); }

		if (isFormLocked) {
			const saveStatusEl = document.getElementById("sauna-save-status");
			if (saveStatusEl) {
				saveStatusEl.innerText = "🟢 บันทึกสำเร็จ"; saveStatusEl.classList.add("show-toast");
				setTimeout(() => { saveStatusEl.classList.remove("show-toast"); setTimeout(() => { saveStatusEl.innerText = ""; }, 400); }, 3000);
			}
		}
	} else {
	if (typeof window.unlockFormPanel === 'function') { window.unlockFormPanel('sauna'); }
		if (typeof window.unlockSaunaFormOnly === 'function') { window.unlockSaunaFormOnly(); }
	}
		
	if (!window.saunaReady) {
        window.saunaReady = true;
        if (typeof window.checkAllConfigsReady === 'function') window.checkAllConfigsReady();
    }
    // ฝังเพิ่มตรงนี้ (Draft 25.3): รันประเมินสลับไฟวงกลมซาวน่าทุกรอบ 5 วินาทีปกติ หาก Ready สำเร็จจะติดไฟเขียว 🟢 นิ่งถาวรทนทาน
    if (typeof window.syncPurpleCardDots === 'function') {
        window.syncPurpleCardDots('sauna');
    }
    window.forceSaunaSync = false;
};

console.log("Sauna Telemetry Receiver (sauna-read.js) active.");

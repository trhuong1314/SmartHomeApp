/** @file main.c
 * @brief Nhấp nháy LED PB12 dùng DWT làm mốc thời gian
 * @note Không dùng vòng lặp rỗng để delay
 * 		 SYSCLK sau reset = HSI 8MHz
 */

#include "stm32f103xb.h"
#include "led.h"

// Tần số SYSCLK thực tế
static const uint32_t SYSCLK_HZ = 8000000UL;

// Chu kỳ nhấp nháy LED (ms)
static const uint32_t LED_INTERVAL_MS = 500UL;

/**
 * @brief Bật DWT làm mốc thời gian theo chu kỳ CPU
 * @note Yêu cầu TRCENA trong DEMCR và CYCCNTENA trong DWT_CTRL
 */
static void dwt_init(void)
{
	// Bật trace/debug để DWT hoạt động
	CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;

	// Reset bộ đếm chu kỳ về 0 trước khi bật
	DWT->CYCCNT = 0;

	// Bật bộ đếm CYCCNT
	DWT->CTRL |= DWT_CTRL_CYCCNTENA_Msk;
}

/** @brief Đọc số chu kỳ CPU đã trôi qua kể từ khi dwt_init */
static inline uint32_t dwt_cycles(void)
{
	return DWT->CYCCNT;
}

/**
 * @brief chuyển đổi mili giây sang số chu kỳ CPU
 * @note  dùng 64 bit trung gian để tránh tràn khi nhân
 */
static uint32_t ms_to_cycles(uint32_t ms)
{
	return (uint32_t)(((uint64_t)ms * SYSCLK_HZ) / 1000ULL);
}

int main(void)
{
	// Khởi tạo LED (PB12 output push-pull, led tắt)
	led_init();

	// Khởi tạo mốc thời gian
	dwt_init();

	const uint32_t interval_cycles = ms_to_cycles(LED_INTERVAL_MS);

	// Mốc thời điểm đổi led kế tiếp
	uint32_t next_toggle = dwt_cycles() + interval_cycles;

	// Trạng thái led hiện tại: 0 = tắt, 1 = sáng
	uint8_t led_is_on = 0;

	while(1)
	{
		uint32_t now = dwt_cycles();

		if ((int32_t)(now - next_toggle) >= 0) {
			if (led_is_on) {
				led_off();
				led_is_on = 0;
			} else {
				led_on();
				led_is_on = 1;
			}
			next_toggle += interval_cycles;
		}
	}
}

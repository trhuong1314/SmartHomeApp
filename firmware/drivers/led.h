/** @file led.h
 *  @brief Điều khiển LED PB12, sáng mức thấp, dùng chung hai bản ứng dụng.
 */
#ifndef LED_H
#define LED_H

/**
 * @brief Cấu hình PB12 output push-pull 2 MHz, LED ban đầu tắt.
 * @note Gọi trước khi bật các ngắt/task có thể cấu hình GPIOB.
 *       Gọi lại sẽ đưa LED về trạng thái tắt.
 */
void led_init(void);

/** @brief Bật LED (PB12 = 0). Phải gọi led_init() trước. */
void led_on(void);

/** @brief Tắt LED (PB12 = 1). Phải gọi led_init() trước. */
void led_off(void);

#endif /* LED_H */

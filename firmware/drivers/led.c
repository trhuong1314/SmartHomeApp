/** @file led.c
 *  @brief Bài mẫu CMSIS: LED PB12 sáng mức thấp, không dùng HAL/LL.
 */
#include "led.h"
#include "stm32f103xb.h"

/* Mapping cố định theo PCB; các tên bit lấy từ header CMSIS. */
#define LED_GPIO                 GPIOB
#define LED_GPIO_CLOCK_ENABLE    RCC_APB2ENR_IOPBEN
#define LED_CONFIG_MASK          (GPIO_CRH_MODE12 | GPIO_CRH_CNF12)
#define LED_OUTPUT_PP_2MHZ       GPIO_CRH_MODE12_1
#define LED_SET_HIGH             GPIO_BSRR_BS12
#define LED_SET_LOW              GPIO_BSRR_BR12

void led_init(void)
{
    uint32_t config;

    /* Bật clock GPIOB; đọc lại để tạo khoảng trễ trước truy cập GPIO. */
    RCC->APB2ENR |= LED_GPIO_CLOCK_ENABLE;
    (void)RCC->APB2ENR;

    /* Đặt latch mức tắt trước khi chuyển chân sang output. */
    LED_GPIO->BSRR = LED_SET_HIGH;

    /* Chỉ đổi trường PB12: CNF12 = 00, MODE12 = 10 (2 MHz). */
    config = LED_GPIO->CRH;
    config &= ~LED_CONFIG_MASK;
    config |= LED_OUTPUT_PP_2MHZ;
    LED_GPIO->CRH = config;
}

void led_on(void)
{
    /* Nửa trên BSRR xóa bit ODR: PB12 xuống 0, LED sáng. */
    LED_GPIO->BSRR = LED_SET_LOW;
}

void led_off(void)
{
    /* Nửa dưới BSRR đặt bit ODR: PB12 lên 1, LED tắt. */
    LED_GPIO->BSRR = LED_SET_HIGH;
}

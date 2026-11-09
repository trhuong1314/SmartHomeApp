/* Startup C99 cho GCC, boot trực tiếp từ Flash sau reset phần cứng. */
#include <stdint.h>
#include "stm32f103xb.h"

/* Symbol linker là địa chỉ, không phải biến chứa giá trị địa chỉ. */
extern uint32_t _estack;
extern uint32_t _sidata;
extern uint32_t _sdata;
extern uint32_t _edata;
extern uint32_t _sbss;
extern uint32_t _ebss;
extern int main(void);

/* Khai báo các handler mặc định*/
void Reset_Handler(void);
void Default_Handler(void);

/* Chỉ đúng khi giữ clock mặc định sau reset: HSI 8 MHz. */
uint32_t SystemCoreClock = 8000000U;

/* Hàm thật cùng tên sẽ thay alias yếu khi link. */
#define WEAK_HANDLER(name) void name(void) __attribute__((weak, alias("Default_Handler")))
WEAK_HANDLER(NMI_Handler);
WEAK_HANDLER(HardFault_Handler);
WEAK_HANDLER(MemManage_Handler);
WEAK_HANDLER(BusFault_Handler);
WEAK_HANDLER(UsageFault_Handler);
WEAK_HANDLER(SVC_Handler);
WEAK_HANDLER(DebugMon_Handler);
WEAK_HANDLER(PendSV_Handler);
WEAK_HANDLER(SysTick_Handler);
WEAK_HANDLER(WWDG_IRQHandler);
WEAK_HANDLER(PVD_IRQHandler);
WEAK_HANDLER(TAMPER_IRQHandler);
WEAK_HANDLER(RTC_IRQHandler);
WEAK_HANDLER(FLASH_IRQHandler);
WEAK_HANDLER(RCC_IRQHandler);
WEAK_HANDLER(EXTI0_IRQHandler);
WEAK_HANDLER(EXTI1_IRQHandler);
WEAK_HANDLER(EXTI2_IRQHandler);
WEAK_HANDLER(EXTI3_IRQHandler);
WEAK_HANDLER(EXTI4_IRQHandler);
WEAK_HANDLER(DMA1_Channel1_IRQHandler);
WEAK_HANDLER(DMA1_Channel2_IRQHandler);
WEAK_HANDLER(DMA1_Channel3_IRQHandler);
WEAK_HANDLER(DMA1_Channel4_IRQHandler);
WEAK_HANDLER(DMA1_Channel5_IRQHandler);
WEAK_HANDLER(DMA1_Channel6_IRQHandler);
WEAK_HANDLER(DMA1_Channel7_IRQHandler);
WEAK_HANDLER(ADC1_2_IRQHandler);
WEAK_HANDLER(USB_HP_CAN1_TX_IRQHandler);
WEAK_HANDLER(USB_LP_CAN1_RX0_IRQHandler);
WEAK_HANDLER(CAN1_RX1_IRQHandler);
WEAK_HANDLER(CAN1_SCE_IRQHandler);
WEAK_HANDLER(EXTI9_5_IRQHandler);
WEAK_HANDLER(TIM1_BRK_IRQHandler);
WEAK_HANDLER(TIM1_UP_IRQHandler);
WEAK_HANDLER(TIM1_TRG_COM_IRQHandler);
WEAK_HANDLER(TIM1_CC_IRQHandler);
WEAK_HANDLER(TIM2_IRQHandler);
WEAK_HANDLER(TIM3_IRQHandler);
WEAK_HANDLER(TIM4_IRQHandler);
WEAK_HANDLER(I2C1_EV_IRQHandler);
WEAK_HANDLER(I2C1_ER_IRQHandler);
WEAK_HANDLER(I2C2_EV_IRQHandler);
WEAK_HANDLER(I2C2_ER_IRQHandler);
WEAK_HANDLER(SPI1_IRQHandler);
WEAK_HANDLER(SPI2_IRQHandler);
WEAK_HANDLER(USART1_IRQHandler);
WEAK_HANDLER(USART2_IRQHandler);
WEAK_HANDLER(USART3_IRQHandler);
WEAK_HANDLER(EXTI15_10_IRQHandler);
WEAK_HANDLER(RTC_Alarm_IRQHandler);
WEAK_HANDLER(USBWakeUp_IRQHandler);

/* 16 vector lõi + 43 IRQ; các slot reserved được giữ bằng 0. */
/* uintptr_t 32 bit trên đích ARM; GCC giữ bit Thumb của địa chỉ hàm. */
__attribute__((used, section(".isr_vector"), aligned(256)))
const uintptr_t vector_table[16U + 43U] = {
    (uintptr_t)&_estack, /* 0 */
    (uintptr_t)Reset_Handler, /* 1 */
    (uintptr_t)NMI_Handler, /* 2 */
    (uintptr_t)HardFault_Handler, /* 3 */
    (uintptr_t)MemManage_Handler, /* 4 */
    (uintptr_t)BusFault_Handler, /* 5 */
    (uintptr_t)UsageFault_Handler, /* 6 */
    0U, /* 7 */
    0U, /* 8 */
    0U, /* 9 */
    0U, /* 10 */
    (uintptr_t)SVC_Handler, /* 11 */
    (uintptr_t)DebugMon_Handler, /* 12 */
    0U, /* 13 */
    (uintptr_t)PendSV_Handler, /* 14 */
    (uintptr_t)SysTick_Handler, /* 15 */
    (uintptr_t)WWDG_IRQHandler, /* 16 */
    (uintptr_t)PVD_IRQHandler, /* 17 */
    (uintptr_t)TAMPER_IRQHandler, /* 18 */
    (uintptr_t)RTC_IRQHandler, /* 19 */
    (uintptr_t)FLASH_IRQHandler, /* 20 */
    (uintptr_t)RCC_IRQHandler, /* 21 */
    (uintptr_t)EXTI0_IRQHandler, /* 22 */
    (uintptr_t)EXTI1_IRQHandler, /* 23 */
    (uintptr_t)EXTI2_IRQHandler, /* 24 */
    (uintptr_t)EXTI3_IRQHandler, /* 25 */
    (uintptr_t)EXTI4_IRQHandler, /* 26 */
    (uintptr_t)DMA1_Channel1_IRQHandler, /* 27 */
    (uintptr_t)DMA1_Channel2_IRQHandler, /* 28 */
    (uintptr_t)DMA1_Channel3_IRQHandler, /* 29 */
    (uintptr_t)DMA1_Channel4_IRQHandler, /* 30 */
    (uintptr_t)DMA1_Channel5_IRQHandler, /* 31 */
    (uintptr_t)DMA1_Channel6_IRQHandler, /* 32 */
    (uintptr_t)DMA1_Channel7_IRQHandler, /* 33 */
    (uintptr_t)ADC1_2_IRQHandler, /* 34 */
    (uintptr_t)USB_HP_CAN1_TX_IRQHandler, /* 35 */
    (uintptr_t)USB_LP_CAN1_RX0_IRQHandler, /* 36 */
    (uintptr_t)CAN1_RX1_IRQHandler, /* 37 */
    (uintptr_t)CAN1_SCE_IRQHandler, /* 38 */
    (uintptr_t)EXTI9_5_IRQHandler, /* 39 */
    (uintptr_t)TIM1_BRK_IRQHandler, /* 40 */
    (uintptr_t)TIM1_UP_IRQHandler, /* 41 */
    (uintptr_t)TIM1_TRG_COM_IRQHandler, /* 42 */
    (uintptr_t)TIM1_CC_IRQHandler, /* 43 */
    (uintptr_t)TIM2_IRQHandler, /* 44 */
    (uintptr_t)TIM3_IRQHandler, /* 45 */
    (uintptr_t)TIM4_IRQHandler, /* 46 */
    (uintptr_t)I2C1_EV_IRQHandler, /* 47 */
    (uintptr_t)I2C1_ER_IRQHandler, /* 48 */
    (uintptr_t)I2C2_EV_IRQHandler, /* 49 */
    (uintptr_t)I2C2_ER_IRQHandler, /* 50 */
    (uintptr_t)SPI1_IRQHandler, /* 51 */
    (uintptr_t)SPI2_IRQHandler, /* 52 */
    (uintptr_t)USART1_IRQHandler, /* 53 */
    (uintptr_t)USART2_IRQHandler, /* 54 */
    (uintptr_t)USART3_IRQHandler, /* 55 */
    (uintptr_t)EXTI15_10_IRQHandler, /* 56 */
    (uintptr_t)RTC_Alarm_IRQHandler, /* 57 */
    (uintptr_t)USBWakeUp_IRQHandler, /* 58 */
};

/** Khởi tạo môi trường C trước khi bàn giao cho ứng dụng. */
void Reset_Handler(void)
{
    const uint32_t *source = &_sidata;
    volatile uint32_t *target = &_sdata;

    /* Copy ảnh khởi tạo từ Flash sang RAM, từng word 4 byte. (copy .data từ Flash sang RAM) */
    while ((uintptr_t)target < (uintptr_t)&_edata) {
        *target++ = *source++;
    }

    /* RAM không tự có giá trị 0 sau reset. (zero .bss) */
    target = &_sbss;
    while ((uintptr_t)target < (uintptr_t)&_ebss) {
        *target++ = 0U;
    }

    /* Dùng địa chỉ Flash thật cho bảng vector sau khi boot. */
    SCB->VTOR = (uint32_t)(uintptr_t)vector_table;
    __DSB();
    __ISB();

    /* Giữ HSI sau reset; chưa gọi SystemInit hay constructor C++. */
    (void)main();
    Default_Handler();
}

/** Điểm dừng lỗi có chủ ý; đặt breakpoint để xem IPSR/call stack. */
void Default_Handler(void)
{
    __disable_irq();
    for (;;) {
        __NOP();
    }
}

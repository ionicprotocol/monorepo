import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);
const { Handle } = Slider;

const handle = props => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <SliderTooltip
      prefixCls="rc-slider-tooltip"
      overlay={`${value} %`}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </SliderTooltip>
  );
};

const wrapperStyle = { width: 400, margin: 50 };

const MaxBorrowSlider = () => (
  <div>
    <div style={wrapperStyle}>
      <Slider min={0} max={100} defaultValue={3} />
    </div>
  </div>
)

export default MaxBorrowSlider
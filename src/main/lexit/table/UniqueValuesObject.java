package table;

import java.util.ArrayList;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

@XmlRootElement(name="root")
public class UniqueValuesObject
{

  @XmlElementWrapper(name="values")
  @XmlElement(name="oneValue")
  public ArrayList<String> values = new ArrayList<String>();

  @XmlTransient
  public ArrayList<String> getValues() { return this.values; }
  public void setValues(ArrayList<String> newValues) {
    this.values = newValues;
  }
  public void addValue(String newValue) {
    this.values.add(newValue);
  }
}